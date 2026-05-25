import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const CsvMerger = () => {
  const [mergedData, setMergedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndMergeCSVs = async () => {
      try {
        // 1. Fetch both CSV files from the public folder
        const [res1, res2] = await Promise.all([
          fetch('/mastersheet.csv'),
          fetch('/AC 2026 - Data Final 2.csv')
        ]);

        const csvText1 = await res1.text();
        const csvText2 = await res2.text();

        // 2. Parse both CSVs
        const parsed1 = Papa.parse(csvText1, { header: true, skipEmptyLines: true });
        const parsed2 = Papa.parse(csvText2, { header: true, skipEmptyLines: true });

        const sheet1Data = parsed1.data;
        const sheet2Data = parsed2.data;

        // 3. Create a lookup map for Sheet 2 based on CNIC
        // This makes matching super fast and handles trailing spaces in column names
        const profileMap = {};
        
        sheet2Data.forEach((row) => {
          // Find the exact key names by trimming spaces (handles "CNIC " vs "CNIC")
          const cnicKey = Object.keys(row).find(k => k.trim() === 'CNIC');
          const gradeKey = Object.keys(row).find(k => k.trim() === 'Grade');
          const cgpaKey = Object.keys(row).find(k => k.trim() === 'CGPA');
          const profileMatchKey = Object.keys(row).find(k => k.trim() === 'PROFILE MATCH');

          const cnicValue = row[cnicKey]?.trim();
          
          if (cnicValue) {
            profileMap[cnicValue] = {
              Grade: row[gradeKey] || '',
              CGPA: row[cgpaKey] || '',
              'PROFILE MATCH': row[profileMatchKey] || ''
            };
          }
        });

        // 4. Map through Sheet 1 (keeping exact order) and append the new columns
        const finalData = sheet1Data.map((row) => {
          const cnicKey1 = Object.keys(row).find(k => k.trim() === 'CNIC');
          const cnicValue = row[cnicKey1]?.trim();

          // Look up the CNIC in our map, default to empty strings if not found
          const profileInfo = profileMap[cnicValue] || { Grade: '', CGPA: '', 'PROFILE MATCH': '' };

          // Return the original row PLUS the 3 new columns at the end
          return {
            ...row,
            Grade: profileInfo.Grade,
            CGPA: profileInfo.CGPA,
            'PROFILE MATCH': profileInfo['PROFILE MATCH']
          };
        });

        // 5. Save to state
        if (finalData.length > 0) {
          setHeaders(Object.keys(finalData[0]));
          setMergedData(finalData);
        }
        setLoading(false);

      } catch (error) {
        console.error("Error fetching or parsing CSV files:", error);
        setLoading(false);
      }
    };

    fetchAndMergeCSVs();
  }, []);

  // Function to download the merged data back as a CSV file
  const downloadCSV = () => {
    const csv = Papa.unparse(mergedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Merged_Master_Sheet.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading and merging data...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Candidate Data Merger</h2>
      
      <button 
        onClick={downloadCSV} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Download Merged CSV
      </button>

      {/* Scrollable table container */}
      <div style={{ overflowX: 'auto', maxHeight: '70vh', border: '1px solid #ccc' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', whiteSpace: 'nowrap' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f4f4f4', zIndex: 1 }}>
            <tr>
              {headers.map((header, index) => (
                <th key={index} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mergedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex} style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CsvMerger;