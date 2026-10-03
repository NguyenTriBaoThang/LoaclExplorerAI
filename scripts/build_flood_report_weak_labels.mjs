import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = path.resolve("data/raw/flood_training.csv");
const outputPath = path.resolve("data/experimental/flood_training_weak_labels.csv");
const seed = 20261003;
const force = process.argv.includes("--force");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("Input CSV has an unterminated quoted field.");
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function serializeCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = value === null || value === undefined ? "" : String(value);
          return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
        })
        .join(","),
    )
    .join("\r\n");
}

function hash(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function stableId(prefix, key) {
  return `${prefix}-${hash(key).slice(0, 16)}`;
}

function seededRandom(seedText) {
  let state = Number.parseInt(hash(seedText).slice(0, 8), 16) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function parseSourceDate(value, obsId) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) throw new Error(`Unrecognized non-empty Date for ${obsId}: ${value}`);
  const [, day, month, year] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() + 1 !== Number(month) ||
    parsed.getUTCDate() !== Number(day)
  ) {
    throw new Error(`Invalid calendar date for ${obsId}: ${value}`);
  }
  return { day: Number(day), month: Number(month), year: Number(year) };
}

function locationParts(source) {
  const locationName = source["Location name"].trim();
  const locationType = source["Location type"].trim();
  const currentAdminUnit = source["Current admin unit"].trim();
  const districtMentioned = source["District mentioned"].trim();
  const province = source.Province.trim();
  const administrativeArea = currentAdminUnit || districtMentioned || province;
  if (!locationName || !locationType || !administrativeArea) {
    throw new Error(`Missing location key fields for ${source.Obs_id}.`);
  }
  return {
    locationName,
    locationType,
    currentAdminUnit,
    districtMentioned,
    administrativeArea,
    siteKey: JSON.stringify([locationName, locationType, administrativeArea]),
  };
}

function getOrCreateSiteYear(siteYears, location, year) {
  const key = JSON.stringify([location.siteKey, year]);
  let siteYear = siteYears.get(key);
  if (!siteYear) {
    siteYear = { ...location, year, hasUnknownMonth: false, reportedMonths: new Set() };
    siteYears.set(key, siteYear);
  }
  return siteYear;
}

function csvRecords(text) {
  const parsed = parseCsv(text.replace(/^\uFEFF/, ""));
  if (parsed.length < 2) throw new Error("Source CSV has no observation rows.");
  const headers = parsed[0];
  const required = [
    "Obs_id",
    "Date",
    "Year",
    "Location name",
    "Location type",
    "District mentioned",
    "Province",
    "Current admin unit",
    "Source id",
  ];
  const missing = required.filter((name) => !headers.includes(name));
  if (missing.length) throw new Error(`Missing required source columns: ${missing.join(", ")}`);

  return parsed.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`CSV row ${index + 2} has ${values.length} values; expected ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((name, column) => [name, values[column]]));
  });
}

const sourceText = await readFile(inputPath, "utf8");
const sourceRows = csvRecords(sourceText);
const siteYears = new Map();
const positiveMonths = new Map();
let missingDateRows = 0;
let inconsistentDateYearRows = 0;

for (const source of sourceRows) {
  const yearFromColumn = Number(source.Year);
  if (!Number.isInteger(yearFromColumn)) throw new Error(`Invalid Year for ${source.Obs_id}.`);
  const location = locationParts(source);
  const siteYear = getOrCreateSiteYear(siteYears, location, yearFromColumn);

  if (!source.Date.trim()) {
    siteYear.hasUnknownMonth = true;
    missingDateRows += 1;
    continue;
  }

  const date = parseSourceDate(source.Date, source.Obs_id);
  if (date.year !== yearFromColumn) {
    siteYear.hasUnknownMonth = true;
    getOrCreateSiteYear(siteYears, location, date.year).hasUnknownMonth = true;
    inconsistentDateYearRows += 1;
    continue;
  }
  siteYear.reportedMonths.add(date.month);
  const positiveKey = JSON.stringify([location.siteKey, date.year, date.month]);
  let group = positiveMonths.get(positiveKey);
  if (!group) {
    group = {
      ...location,
      year: date.year,
      month: date.month,
      sourceRows: [],
      sourceDates: new Set(),
      sourceIds: new Set(),
    };
    positiveMonths.set(positiveKey, group);
  }
  group.sourceRows.push(source);
  group.sourceDates.add(source.Date.trim());
  if (source["Source id"].trim()) group.sourceIds.add(source["Source id"].trim());
}

const eligibleSiteYears = [...siteYears.values()].filter(
  (siteYear) => !siteYear.hasUnknownMonth && siteYear.reportedMonths.size > 0,
);
const excludedSiteYearsWithUnknownMonth = [...siteYears.values()].filter(
  (siteYear) => siteYear.hasUnknownMonth,
).length;
const eligiblePositives = [...positiveMonths.values()].filter((group) => {
  const key = JSON.stringify([group.siteKey, group.year]);
  return !siteYears.get(key).hasUnknownMonth;
});

const rows = [];
const outputFields = [
  "sample_id",
  "location_year_group_id",
  "location_name",
  "location_type",
  "administrative_area_key",
  "current_admin_unit",
  "district_mentioned",
  "year",
  "month",
  "target_public_report_present",
  "label_status",
  "label_evidence",
  "target_definition",
  "temporal_granularity",
  "audit_source_obs_ids",
  "audit_source_ids",
  "audit_source_dates",
  "audit_source_row_count",
  "pseudo_negative_candidate_months",
  "case_control_sampling_weight",
  "sampling_seed",
  "source_dataset_doi",
];

const targetDefinition =
  "Presence of a flood-report row in this public source for this named location and calendar month; not physical flood status.";
const sourceDoi = "10.23708/8Y16HU";
const sourceUrl = "https://dataverse.ird.fr/dataset.xhtml?persistentId=doi:10.23708/8Y16HU";

for (const group of eligiblePositives) {
  const sortedRows = [...group.sourceRows].sort((a, b) => a.Obs_id.localeCompare(b.Obs_id));
  const siteYearKey = JSON.stringify([group.siteKey, group.year]);
  rows.push({
    sample_id: stableId("P", JSON.stringify([group.siteKey, group.year, group.month, 1])),
    location_year_group_id: stableId("GY", siteYearKey),
    location_name: group.locationName,
    location_type: group.locationType,
    administrative_area_key: group.administrativeArea,
    current_admin_unit: group.currentAdminUnit,
    district_mentioned: group.districtMentioned,
    year: group.year,
    month: group.month,
    target_public_report_present: 1,
    label_status: "documented_report",
    label_evidence: "At least one source observation matches this location and month.",
    target_definition: targetDefinition,
    temporal_granularity: "calendar_month",
    audit_source_obs_ids: sortedRows.map((source) => source.Obs_id).join("|"),
    audit_source_ids: [...group.sourceIds].sort().join("|"),
    audit_source_dates: [...group.sourceDates].sort().join("|"),
    audit_source_row_count: sortedRows.length,
    pseudo_negative_candidate_months: "",
    case_control_sampling_weight: 1,
    sampling_seed: "",
    source_dataset_doi: sourceDoi,
  });
}

let pseudoNegativeCount = 0;
let candidateNegativeCount = 0;
for (const siteYear of eligibleSiteYears) {
  const reportedMonths = [...siteYear.reportedMonths].sort((a, b) => a - b);
  const candidates = Array.from({ length: 12 }, (_, index) => index + 1).filter(
    (month) => !siteYear.reportedMonths.has(month),
  );
  candidateNegativeCount += candidates.length;
  if (candidates.length < reportedMonths.length) {
    throw new Error(`Cannot balance pseudo-negatives for ${siteYear.locationName}, ${siteYear.year}.`);
  }

  const sampled = shuffle(candidates, seededRandom(`${seed}|${siteYear.siteKey}|${siteYear.year}`)).slice(
    0,
    reportedMonths.length,
  );
  const samplingWeight = candidates.length / sampled.length;
  for (const month of sampled.sort((a, b) => a - b)) {
    const negativeKey = JSON.stringify([siteYear.siteKey, siteYear.year, month, 0]);
    rows.push({
      sample_id: stableId("N", negativeKey),
      location_year_group_id: stableId("GY", JSON.stringify([siteYear.siteKey, siteYear.year])),
      location_name: siteYear.locationName,
      location_type: siteYear.locationType,
      administrative_area_key: siteYear.administrativeArea,
      current_admin_unit: siteYear.currentAdminUnit,
      district_mentioned: siteYear.districtMentioned,
      year: siteYear.year,
      month,
      target_public_report_present: 0,
      label_status: "pseudo_no_matching_record",
      label_evidence:
        "No matching row was found in this source for this location-month; actual flood status is unknown.",
      target_definition: targetDefinition,
      temporal_granularity: "calendar_month",
      audit_source_obs_ids: "",
      audit_source_ids: "",
      audit_source_dates: "",
      audit_source_row_count: 0,
      pseudo_negative_candidate_months: candidates.length,
      case_control_sampling_weight: Number(samplingWeight.toFixed(6)),
      sampling_seed: seed,
      source_dataset_doi: sourceDoi,
    });
    pseudoNegativeCount += 1;
  }
}

if (pseudoNegativeCount !== eligiblePositives.length) {
  throw new Error("Weak-label set is not balanced after sampling.");
}

rows.sort(
  (a, b) =>
    a.year - b.year ||
    a.month - b.month ||
    a.administrative_area_key.localeCompare(b.administrative_area_key) ||
    a.location_name.localeCompare(b.location_name) ||
    a.target_public_report_present - b.target_public_report_present,
);

const outputExists = await access(outputPath).then(
  () => true,
  () => false,
);
if (outputExists && !force) {
  throw new Error(`Output already exists. Re-run with --force only if you intend to replace it: ${outputPath}`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
const csvText = serializeCsv([outputFields, ...rows.map((row) => outputFields.map((field) => row[field]))]);
await writeFile(outputPath, `\uFEFF${csvText}\r\n`, "utf8");

console.log(
  JSON.stringify(
    {
      input: path.relative(process.cwd(), inputPath),
      output: path.relative(process.cwd(), outputPath),
      sourceRows: sourceRows.length,
      missingExactDateRows: missingDateRows,
      inconsistentDateYearRows,
      excludedLocationYearsWithUnknownMonth: excludedSiteYearsWithUnknownMonth,
      positiveLocationMonths: eligiblePositives.length,
      pseudoNegativeCandidates: candidateNegativeCount,
      sampledPseudoNegatives: pseudoNegativeCount,
      outputRows: rows.length,
      target: "public report presence by location-month, not flood/no-flood truth",
      seed,
    },
    null,
    2,
  ),
);
