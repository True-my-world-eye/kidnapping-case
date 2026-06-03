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
    timelineMaster
  ] = await Promise.all([
    loadCsvData('/data/anchor_events.csv'),
    loadCsvData('/data/media_stance.csv'),
    loadCsvData('/data/email_network.csv'),
    loadCsvData('/data/network_nodes.csv'),
    loadCsvData('/data/network_edges.csv'),
    loadCsvData('/data/timeline_master.csv')
  ]);

  return {
    anchorEvents,
    mediaStance,
    emailNetwork,
    networkNodes,
    networkEdges,
    timelineMaster
  };
};