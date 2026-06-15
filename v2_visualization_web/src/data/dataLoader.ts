import Papa from 'papaparse';

export const loadCsvData = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const text = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
    return [];
  }
};

export const loadAllData = async () => {
  const [
    anchorEvents,
    mediaStance,
    emailNetwork,
    networkNodes,
    networkEdges,
    timelineMaster,
    sources,
    entities,
    emails,
    employees,
    sourceRelations,
  ] = await Promise.all([
    loadCsvData('/data/anchor_events.csv'),
    loadCsvData('/data/media_stance.csv'),
    loadCsvData('/data/email_network.csv'),
    loadCsvData('/data/network_nodes.csv'),
    loadCsvData('/data/network_edges.csv'),
    loadCsvData('/data/timeline_master.csv'),
    loadCsvData('/data/sources.csv'),
    loadCsvData('/data/entities.csv'),
    loadCsvData('/data/emails.csv'),
    loadCsvData('/data/employee_nodes.csv'),
    loadCsvData('/data/source_relations.csv'),
  ]);

  // Load word frequencies JSON (separate from CSV)
  let wordFrequencies = {};
  try {
    const resp = await fetch('/data/word_frequencies.json');
    wordFrequencies = await resp.json();
  } catch (e) {
    console.warn('word_frequencies.json not found, skipping');
  }

  return {
    anchorEvents,
    mediaStance,
    emailNetwork,
    networkNodes,
    networkEdges,
    timelineMaster,
    sources,
    entities,
    emails,
    employees,
    wordFrequencies,
    sourceRelations,
  };
};