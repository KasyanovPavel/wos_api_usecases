import { expandedApiCall, journalProfileCall, journalMetricsCall } from "./api_operations.js"
import fs from "fs"

export async function run(query, sendProgress) {

  console.log("Running search:", query);

  let initialJson = await expandedApiCall(query, 1);
  sendProgress({
          percent: 0,
          label: "Retrieving Web of Science documents"
      })
  let parsedJson = await parseWosJson(initialJson.data.Data.Records.records.REC)

  let documentsFound = initialJson.data.QueryResult.RecordsFound
  let requestsRequired = Math.floor((documentsFound - 1) / 100) + 1;

  if (requestsRequired > 1) {
      for (let i=1; i<requestsRequired; i++) {
        let subsequentJson = await expandedApiCall(query, i*100+1);
        let parsedPage = await parseWosJson(subsequentJson.data.Data.Records.records.REC)
        parsedJson.push(...parsedPage)
        let percent = Math.floor((i / requestsRequired) * 100)
        sendProgress({
          percent,
          label: "Retrieving Web of Science documents"
      })
    }
  }

  const uniqueJournalYears = new Map()

  for (const record of parsedJson) {
    const journal = record.sourceTitleAbbreviation;
    const year = record.publicationDate?.slice(0, 4);

    if (!journal || !year) continue ;

    const key = `${journal}|${year}`;

    if (!uniqueJournalYears.has(key)) {
      uniqueJournalYears.set(key, {
        journal,
        year,
        JIF: null,
        jifQuartile: null
      });
    };
  };

  let index = 0;
  const total = uniqueJournalYears.size;

  for (const entry of uniqueJournalYears.values()) {

    let journalMetrics = await journalMetricsCall(entry.journal, entry.year);
    entry.JIF = journalMetrics?.data?.metrics?.impactMetrics?.jif ?? null;

    index++;

    let percent = Math.floor((index / total) * 100);

    sendProgress({
      percent,
      label: "Retrieving Journal Metrics"
  });
    
    let categories = journalMetrics?.data?.ranks?.jif;
    
    let quartiles = Array.isArray(categories)
      ? categories
        .map(c => Number(c.quartile?.slice(1)))
        .filter(Number.isFinite)
      : [];

    
    entry.jifQuartile = 
      quartiles.length
        ? `Q${Math.min(...quartiles)}`
        : null;

  }

  parsedJson.forEach(record => {
    const journal = record.sourceTitleAbbreviation;
    const year = record.publicationDate?.slice(0, 4);

    if (!journal || !year) return;

    const key = `${journal}|${year}`;
    record.journalImpactFactor = uniqueJournalYears.get(key).JIF ?? null;
    record.journalBestQuartile = uniqueJournalYears.get(key).jifQuartile ?? null;
  })

  const headers = [
    "UT",
    "Publication Date",
    "Document Title",
    "Source Title",
    "Times Cited",
    "Journal Impact Factor",
    "JIF Quartile"
  ].join("\t");

  const tsv = [
    headers,
    ...parsedJson.map(row =>
      [
        row.uid,
        row.publicationDate,
        row.documentTitle.replace(/\t/g, " "),
        row.sourceTitle.replace(/\t/g, " "),
        row.timesCited,
        row.journalImpactFactor || "N/A",
        row.journalBestQuartile || "N/A"
      ].join("\t")
    )
  ].join("\n");

  let filename = `${query}.tsv`

  fs.writeFileSync(`./downloads/${filename}`, tsv);

  sendProgress({
    percent: 100,
    label: ""
});

  return { parsedJson, filename }
}

export async function runMostRecentJcr(query, sendProgress) {

  console.log("Running search:", query);

  let initialJson = await expandedApiCall(query, 1);
  sendProgress({
          percent: 0,
          label: "Retrieving Web of Science documents"
      })
  let parsedJson = await parseWosJson(initialJson.data.Data.Records.records.REC)

  let documentsFound = initialJson.data.QueryResult.RecordsFound
  let requestsRequired = Math.floor((documentsFound - 1) / 100) + 1;

  if (requestsRequired > 1) {
      for (let i=1; i<requestsRequired; i++) {
        let subsequentJson = await expandedApiCall(query, i*100+1);
        let parsedPage = await parseWosJson(subsequentJson.data.Data.Records.records.REC)
        parsedJson.push(...parsedPage)
        let percent = Math.floor((i / requestsRequired) * 100)
        sendProgress({
          percent,
          label: "Retrieving Web of Science documents"
      })
    }
  }

  const uniqueJournals = new Map()

  for (const record of parsedJson) {
    const journal = record.sourceTitleAbbreviation;

    if (!journal) continue ;

    const key = `${journal}`;

    if (!uniqueJournals.has(key)) {
      uniqueJournals.set(key, {
        journal,
        year: null,
        JIF: null,
        jifQuartile: null
      });
    };
  };

  let index = 0;
  const total = uniqueJournals.size;

  for (const entry of uniqueJournals.values()) {

    entry.year = await journalProfileCall(entry.journal)
    console.log(entry.year)

    let journalMetrics = await journalMetricsCall(entry.journal, entry.year);
    entry.JIF = journalMetrics?.data?.metrics?.impactMetrics?.jif ?? null;

    index++;

    let percent = Math.floor((index / total) * 100);

    sendProgress({
      percent,
      label: "Retrieving Journal Metrics"
  });
    
    let categories = journalMetrics?.data?.ranks?.jif;
    
    let quartiles = Array.isArray(categories)
      ? categories
        .map(c => Number(c.quartile?.slice(1)))
        .filter(Number.isFinite)
      : [];

    
    entry.jifQuartile = 
      quartiles.length
        ? `Q${Math.min(...quartiles)}`
        : null;

  }

  parsedJson.forEach(record => {
    const journal = record.sourceTitleAbbreviation;

    if (!journal) return;

    const key = `${journal}`;
    record.journalImpactFactor = uniqueJournals.get(key).JIF ?? null;
    record.journalBestQuartile = uniqueJournals.get(key).jifQuartile ?? null;
  })

  const headers = [
    "UT",
    "Publication Date",
    "Document Title",
    "Source Title",
    "Times Cited",
    "Journal Impact Factor",
    "JIF Quartile"
  ].join("\t");

  const tsv = [
    headers,
    ...parsedJson.map(row =>
      [
        row.uid,
        row.publicationDate,
        row.documentTitle.replace(/\t/g, " "),
        row.sourceTitle.replace(/\t/g, " "),
        row.timesCited,
        row.journalImpactFactor || "N/A",
        row.journalBestQuartile || "N/A"
      ].join("\t")
    )
  ].join("\n");

  let filename = `${query}.tsv`

  fs.writeFileSync(`./downloads/${filename}`, tsv);

  sendProgress({
    percent: 100,
    label: ""
});

  return { parsedJson, filename }
}


async function parseWosJson(data) {
  return await data.map(record => {
    const documentTitle = record.static_data.summary.titles.title?.find(t => t.type ==="item").content;
    const sourceTitle = record.static_data.summary.titles.title?.find(t => t.type ==="source").content;
    const sourceTitleAbbreviation = record.static_data.summary.titles.title?.find(t => t.type ==="source_abbrev")?.content.replaceAll(" ", "_") ?? null;
    const timesCited = record.dynamic_data.citation_related.tc_list.silo_tc?.find(c => c.coll_id === "WOS").local_count
    return {
      uid: record.UID,
      publicationDate: record.static_data.summary.pub_info.sortdate,
      documentTitle: documentTitle,
      sourceTitle: sourceTitle,
      sourceTitleAbbreviation: sourceTitleAbbreviation,
      timesCited: timesCited
    }
  })
}