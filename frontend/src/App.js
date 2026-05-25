import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Box, Drawer, AppBar, Toolbar, List, Typography, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Chip, Grid, Card, CardContent, Button
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarsIcon from '@mui/icons-material/Stars';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import { Chart, registerables } from 'chart.js';
import PrintIcon from '@mui/icons-material/Print';
import { IconButton, Tooltip } from '@mui/material';

// Register Chart.js components
Chart.register(...registerables);

const drawerWidth = 260;

// Hardcoded Assessor Data
const assessorStats = [
  { name: 'Hareem Humail', mean: 57.15, sd: 16.39191483 },
  { name: 'Ali Ayub', mean: 71.07142857, sd: 7.650684089 },
  { name: 'Faisal Muneeb', mean: 60.83333333, sd: 11.8462371 },
  { name: 'Dania Shahab', mean: 60.75, sd: 12.94515056 },
  { name: 'Kashif Rahim', mean: 78.26666667, sd: 11.6095199 },
  { name: 'Waleed Faridi', mean: 65.375, sd: 10.51771555 },
  { name: 'Uraib Ahmed', mean: 59.8, sd: 10.95445115 },
  { name: 'Iraj Mustafa', mean: 66.55555556, sd: 12.10288387 },
  { name: 'Zaid Imad', mean: 62, sd: 6.633249581 },
  { name: 'Danish Owais', mean: 67.14285714, sd: 7.684721534 },
  { name: 'Rameez Asif Siddiqui', mean: 71.76923077, sd: 4.589620397 },
  { name: 'Usama Razzaque', mean: 71.4, sd: 4.708148964 },
  { name: 'Muhammad Sumair', mean: 57.76470588, sd: 12.98330376 },
  { name: 'Farrukh Shafiq', mean: 59.23529412, sd: 13.3675419 },
  { name: 'Usman Ahmed Khan', mean: 78.07692308, sd: 9.402672833 },
  { name: 'Zunair Khan', mean: 68.16666667, sd: 3.311595789 },
  { name: 'Faisal Masood', mean: 60.66666667, sd: 5.802298395 },
  { name: 'Sabika Haider', mean: 71.06666667, sd: 9.864367548 },
  { name: 'Mohsin Ahmed', mean: 64.03448276, sd: 15.28417192 },
  { name: 'Rhonda Fernandes', mean: 70, sd: 15.73824348 },
  { name: 'Waqar Ali Baloch', mean: 68.42857143, sd: 15.48057982 },
  { name: 'Sumair Shafiq', mean: 74.07692308, sd: 13.06051006 },
  { name: 'Danish Arshad', mean: 63.78571429, sd: 14.95726513 },
  { name: 'Sarmad Qureshi', mean: 71.07142857, sd: 11.89999538 },
  { name: 'Saad Ullah', mean: 61, sd: 6.575355056 },
  { name: 'Anisa Dhanani', mean: 59.33333333, sd: 20.32612888 },
  { name: 'Wajahat Hussain', mean: 69.71428571, sd: 11.44991393 },
  { name: 'Zeeshan Shahid', mean: 67.94117647, sd: 12.72532214 },
  { name: 'Amber Agha', mean: 74.85714286, sd: 8.636747455 },
  { name: 'Hira Azhar', mean: 77.61111111, sd: 6.969588467 },
  { name: 'Ahmer Abdus Samad', mean: 70.61538462, sd: 9.151852832 },
  { name: 'Salman Afzal', mean: 63.54545455, sd: 19.35129782 },
  { name: 'Saeed Ahmed', mean: 69.84615385, sd: 9.511801037 },
  { name: 'Uneeb Zia', mean: 69.61538462, sd: 14.88029156 },
  { name: 'Rai Adil Zubair', mean: 62.30769231, sd: 15.02988476 },
  { name: 'Hiba Saeed', mean: 68.46153846, sd: 11.73041193 },
  { name: 'Omair Mazhar Qureshi', mean: 63.03448276, sd: 19.73481832 },
  { name: 'Quaid Khan', mean: 76.5, sd: 9.356572799 },
  { name: 'Haris Fudda', mean: 71.08, sd: 15.10220734 },
  { name: 'Kanza Afzal', mean: 55.08333333, sd: 12.18388155 },
  { name: 'Agha Abbas', mean: 65.61538462, sd: 9.233439785 },
  { name: 'Fahad Tariq Rafi', mean: 67.92307692, sd: 3.475186769 },
  { name: 'Sameer Amlani', mean: 54.15384615, sd: 22.77369152 },
  { name: 'Qamber Rizvi', mean: 74.42857143, sd: 7.69329664 },
  { name: 'Omer Qasim', mean: 73.71428571, sd: 12.0730378 },
  { name: 'Kamran Z. Rizvi', mean: 42.25, sd: 7.066015244 },
  { name: 'Haider Ali Taj', mean: 76.92307692, sd: 10.4200251 },
  { name: 'Zohair Islam', mean: 73.75, sd: 12.97637714 },
  { name: 'Hina Qureshi', mean: 68.5, sd: 7.231873893 },
  { name: 'Owais Magrabi', mean: 66.92307692, sd: 11.7222121 },
  { name: 'Waleed Anwar', mean: 57.42857143, sd: 17.31913338 }
];

// Standard Normal CDF Approximation (to convert Z-Score to Percentile)
const normalCDF = (x) => {
  let t = 1 / (1 + 0.2316419 * Math.abs(x));
  let d = 0.3989422804014327 * Math.exp(-x * x / 2);
  let p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - p : p;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [masterData, setMasterData] = useState([]);
  const [assessmentData, setAssessmentData] = useState([]);
  const [finalResults, setFinalResults] = useState([]);
  const [starCnics, setStarCnics] = useState(new Set());
  
  const [competencyAverages, setCompetencyAverages] = useState([]);
const [clusterAverages, setClusterAverages] = useState([]);
  const [loading, setLoading] = useState(true);
const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);

  const cleanHeaders = (data) => {
    return data.map(row => {
      const cleanedRow = {};
      Object.keys(row).forEach(key => {
        cleanedRow[key.trim()] = row[key];
      });
      return cleanedRow;
    });
  };

const calculateAverages = (data) => {
    const compStats = {};
    const knownRounds = ['Battle of Wesnoth', 'The Ultimate Resource Challenge', 'Conflict Roleplays'];

    const compMap = {
      'Achievement Focus': 'Achievement Focus', 'Business Acumen': 'Business Acumen',
      'Commitment to Process Improvement': 'Commitment to Process Improvement', 'Customer Focus': 'Customer Focus',
      'Decision Making': 'Decision Making', 'Developing Others': 'Developing others',
      'Individual Acumen': 'Individual Acumen', 'Interpersonal Savy': 'Interpersonal Savvy', 
      'Problem Solving': 'Problem Solving', 'Stakeholder Management': 'Stakeholder Management',
      'Teamwork & Collaboration': 'Teamwork and Collaboration' 
    };

    const clusterMap = {
      'Interpersonal Savvy': 'Collaborate for Success', 'Stakeholder Management': 'Collaborate for Success',
      'Developing others': 'Collaborate for Success', 'Teamwork and Collaboration': 'Collaborate for Success',
      'Customer Focus': 'Drive for Results', 'Achievement Focus': 'Drive for Results',
      'Commitment to Process Improvement': 'Drive for Results', 'Business Acumen': 'Achieving Excellence',
      'Individual Acumen': 'Achieving Excellence', 'Problem Solving': 'Achieving Excellence',
      'Decision Making': 'Achieving Excellence'
    };

    Object.values(compMap).forEach(comp => compStats[comp] = { sum: 0, count: 0 });

    data.forEach(row => {
      Object.keys(row).forEach(key => {
        const matchedRound = knownRounds.find(r => key.startsWith(r + '-'));
        if (matchedRound) {
          const value = parseFloat(row[key]);
          if (!isNaN(value)) {
            const rawCompName = key.replace(matchedRound + '-', '').trim();
            const normalizedCompName = compMap[rawCompName];
            if (normalizedCompName) {
              compStats[normalizedCompName].sum += value;
              compStats[normalizedCompName].count += 1;
            }
          }
        }
      });
    });

    // 1. Calculate individual competency averages
    const compAveragesRaw = Object.keys(compStats).map(k => ({
      name: k, 
      avgVal: compStats[k].count > 0 ? (compStats[k].sum / compStats[k].count) : 0
    }));

    setCompetencyAverages(compAveragesRaw.map(c => ({
      name: c.name, avg: c.avgVal.toFixed(2)
    })).sort((a, b) => a.name.localeCompare(b.name)));

    // 2. Sum them up for the Clusters
    const clusterTotals = {
      'Collaborate for Success': 0,
      'Drive for Results': 0,
      'Achieving Excellence': 0
    };

    compAveragesRaw.forEach(comp => {
      const clusterName = clusterMap[comp.name];
      if (clusterName) {
        clusterTotals[clusterName] += comp.avgVal;
      }
    });

    setClusterAverages(Object.keys(clusterTotals).map(k => ({
      name: k, 
      avg: clusterTotals[k].toFixed(2),
      max: k === 'Drive for Results' ? 12 : 16 // Set max score for UI
    })));
  };
  const calculateFinalResults = (cleanedMaster, cleanedAssessment, profileData) => {
    const profileMap = {};
    profileData.forEach(row => {
      const cnic = row['CNIC']?.trim();
      if (cnic) {
        profileMap[cnic] = {
          Grade: row['Grade']?.trim() || '',
          CGPA: row['CGPA']?.trim() || '',
          ProfileMatch: row['PROFILE MATCH']?.trim() || ''
        };
      }
    });

    const acCandidateStats = {};
    const stars = new Set();

    cleanedAssessment.forEach(row => {
      const cnic = row['CNIC']?.trim();
      const totalScore = parseFloat(row['Total Score']);
      const assessorName = row['Assessor Name']?.trim();
      const isStar = row['Star Candidate']?.trim().toLowerCase() === 'yes';
      
      if (cnic) {
        if (isStar) stars.add(cnic); // Add to Star List if any assessor said 'Yes'

        if (!isNaN(totalScore) && assessorName) {
          const assessor = assessorStats.find(a => a.name === assessorName);
          if (assessor) {
            const zScore = (totalScore - assessor.mean) / assessor.sd;
            if (!acCandidateStats[cnic]) {
              acCandidateStats[cnic] = { zSum: 0, count: 0 };
            }
            acCandidateStats[cnic].zSum += zScore;
            acCandidateStats[cnic].count += 1;
          }
        }
      }
    });

    setStarCnics(stars); // Save star candidates to state

    let results = [];
    cleanedMaster.forEach(row => {
      const cnic = row['CNIC']?.trim();
      
      if (acCandidateStats[cnic]) {
        const profileInfo = profileMap[cnic] || {};
        const cgpaRaw = profileInfo.CGPA || '';
        const gradeRaw = profileInfo.Grade || row['Grade']?.trim() || ''; 
        const profileMatchRaw = profileInfo.ProfileMatch || '';

        const cgpaMatch = cgpaRaw.match(/([\d.]+)/);
        const cgpaVal = cgpaMatch ? parseFloat(cgpaMatch[1]) : 0;
        const cgpaWeight = (cgpaVal / 4) * 20;

        let interviewRaw = 0;
        if (gradeRaw === 'A+') interviewRaw = 10;
        else if (gradeRaw === 'A') interviewRaw = 7.5;
        const interviewWeight = (interviewRaw / 10) * 15; 

        const profileVal = parseFloat(profileMatchRaw.replace('%', '')) || 0;
        const profileWeight = (profileVal / 100) * 25;

        const avgZ = acCandidateStats[cnic].zSum / acCandidateStats[cnic].count;
        const percentile = normalCDF(avgZ);
        const acWeight = percentile * 40;

        const totalScore = cgpaWeight + interviewWeight + profileWeight + acWeight;

        results.push({
          'Names': row['Full Name'],
          'CNIC': cnic,
          'University': row['University'],
          'Email': row['Email'],
          'Mobile': row['Mobile Number'],
          'City of Residence': row['City of Residence'],
          'Graduate Degree': row['Graduate Degree - Majors (Eg: BBA-HR)'],
          'Cgpa': cgpaRaw,
          'Cgpa Weightage (20%)': cgpaWeight,
          'Screening Interview': gradeRaw,
          'Screening Interview(15%)': interviewWeight,
          'Test Score/Role Fit': profileMatchRaw,
          'Test Score/ Role Fit (25%)': profileWeight,
          'AC Percentile': percentile * 100,
          'AC Weightage (40%)': acWeight,
          'Total Score': totalScore,
          'Star Candidate': stars.has(cnic) ? 'Yes' : 'No' 
        });
      }
    });

    results.sort((a, b) => b['AC Percentile'] - a['AC Percentile']);
    results.forEach((res, idx) => res['AC Rank'] = idx + 1);

    results.sort((a, b) => b['Total Score'] - a['Total Score']);
    results.forEach((res, idx) => res['Final Rank'] = idx + 1);

    setFinalResults(results);
  };

  useEffect(() => {
    const fetchCSVs = async () => {
      try {
        const [masterRes, assessmentRes, profileRes] = await Promise.all([
          fetch('/mastersheet.csv'),
          fetch('/HOH - Assessment Center 2026 - Sheet1.csv'),
          fetch('/AC 2026 - Data Final 2.csv')
        ]);

        const masterText = await masterRes.text();
        const assessmentText = await assessmentRes.text();
        const profileText = await profileRes.text();

        const parsedMaster = Papa.parse(masterText, { header: true, skipEmptyLines: true });
        const parsedAssessment = Papa.parse(assessmentText, { header: true, skipEmptyLines: true });
        const parsedProfile = Papa.parse(profileText, { header: true, skipEmptyLines: true });

        const cleanedMaster = cleanHeaders(parsedMaster.data);
        const cleanedAssessment = cleanHeaders(parsedAssessment.data);
        const cleanedProfile = cleanHeaders(parsedProfile.data);

        const assessmentCNICs = new Set(cleanedAssessment.map(row => row['CNIC']?.trim()).filter(Boolean));

        const masterWithStatus = cleanedMaster.map(row => ({
          ...row,
          Status: assessmentCNICs.has(row['CNIC']?.trim()) ? 'Present' : 'Absent'
        }));

        setMasterData(masterWithStatus);
        setAssessmentData(cleanedAssessment);
        
        calculateAverages(cleanedAssessment);
        calculateFinalResults(cleanedMaster, cleanedAssessment, cleanedProfile);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading CSV files:", error);
        setLoading(false);
      }
    };

    fetchCSVs();
  }, []);

const getCandidateScores = (cnic) => {
    const rows = assessmentData.filter(r => r['CNIC']?.trim() === cnic);
    
    const compMap = {
      'Achievement Focus': 'Achievement Focus', 'Business Acumen': 'Business Acumen',
      'Commitment to Process Improvement': 'Commitment to Process Improvement', 'Customer Focus': 'Customer Focus',
      'Decision Making': 'Decision Making', 'Developing Others': 'Developing others',
      'Individual Acumen': 'Individual Acumen', 'Interpersonal Savy': 'Interpersonal Savvy', 
      'Problem Solving': 'Problem Solving', 'Stakeholder Management': 'Stakeholder Management',
      'Teamwork & Collaboration': 'Teamwork and Collaboration' 
    };

    const clusterMap = {
      'Interpersonal Savvy': 'Collaborate for Success', 'Stakeholder Management': 'Collaborate for Success',
      'Developing others': 'Collaborate for Success', 'Teamwork and Collaboration': 'Collaborate for Success',
      'Customer Focus': 'Drive for Results', 'Achievement Focus': 'Drive for Results',
      'Commitment to Process Improvement': 'Drive for Results', 'Business Acumen': 'Achieving Excellence',
      'Individual Acumen': 'Achieving Excellence', 'Problem Solving': 'Achieving Excellence',
      'Decision Making': 'Achieving Excellence'
    };

    const knownRounds = ['Battle of Wesnoth', 'The Ultimate Resource Challenge', 'Conflict Roleplays'];

    const compStats = {};
    Object.values(compMap).forEach(c => compStats[c] = { sum: 0, count: 0 });
    const comments = []; 

    rows.forEach(row => {
      let commentText = row['Comments']?.trim();
      
      if (commentText) {
        // Capitalize the very first letter, and any letter immediately following a ". "
        commentText = commentText.replace(/(?:^|\.\s+)([a-z])/g, match => match.toUpperCase());
        
        // Push ONLY the comment text (Assessor name removed)
        comments.push(commentText);
      }

      Object.keys(row).forEach(key => {
        const matchedRound = knownRounds.find(r => key.startsWith(r + '-'));
        if (matchedRound) {
          const val = parseFloat(row[key]);
          if (!isNaN(val)) {
            const rawCompName = key.replace(matchedRound + '-', '').trim();
            const normalizedCompName = compMap[rawCompName];
            if (normalizedCompName) {
              compStats[normalizedCompName].sum += val;
              compStats[normalizedCompName].count += 1;
            }
          }
        }
      });
    });

    // 1. Get Candidate's individual competency averages
    const candidateCompAverages = {};
    Object.keys(compStats).forEach(comp => {
      candidateCompAverages[comp] = compStats[comp].count > 0 ? (compStats[comp].sum / compStats[comp].count) : 0;
    });

    const compScores = competencyAverages.map(ca => candidateCompAverages[ca.name].toFixed(2));

    // 2. Sum them up for the Candidate's Clusters
    const candidateClusterTotals = {
      'Collaborate for Success': 0,
      'Drive for Results': 0,
      'Achieving Excellence': 0
    };

    Object.keys(candidateCompAverages).forEach(comp => {
      const clusterName = clusterMap[comp];
      if (clusterName) {
        candidateClusterTotals[clusterName] += candidateCompAverages[comp];
      }
    });

    const clusterScores = clusterAverages.map(ca => candidateClusterTotals[ca.name].toFixed(2));

    return { compScores, clusterScores, comments };
  };

// 1. Helper to draw charts
  const createChartImage = async (labels, candidateData, meanData, title) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 320; 
    
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'Candidate Score', data: candidateData, backgroundColor: '#005A9C' },
          { label: 'Overall Mean', data: meanData, backgroundColor: '#B31B1B' }
        ]
      },
      options: {
        animation: false,
        responsive: false,
        plugins: { title: { display: true, text: title, font: { size: 18 } } }
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 100)); 
    const imgData = canvas.toDataURL('image/png');
    chart.destroy();
    return imgData;
  };

  // 2. Core Report Builder (Draws 1 candidate's report onto the provided doc)
  const buildCandidateReport = async (doc, candidate) => {
    const { compScores, clusterScores, comments } = getCandidateScores(candidate['CNIC']);

    // HEADER & INFO
    doc.setFontSize(22);
    doc.setTextColor(0, 90, 156); 
    doc.text("House of Habib | Mission Believe", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(179, 27, 27); 
    doc.text("Candidate Assessment Report", 105, 28, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Name: ${candidate['Names']}`, 20, 45);
    doc.text(`CNIC: ${candidate['CNIC']}`, 20, 52);
    doc.text(`University: ${candidate['University']}`, 20, 59);
    doc.text(`Mobile: ${candidate['Mobile']}`, 20, 66);

    doc.text(`CGPA: ${candidate['Cgpa']}`, 120, 45);
    doc.text(`Interview Grade: ${candidate['Screening Interview']}`, 120, 52);
    doc.text(`Profile Match: ${candidate['Test Score/Role Fit']}`, 120, 59);
    doc.text(`AC Rank: #${candidate['AC Rank']}`, 120, 66);

    doc.line(20, 72, 190, 72); 

    // CHARTS
    const compLabels = competencyAverages.map(c => c.name);
    const compMean = competencyAverages.map(c => c.avg);
    const compImg = await createChartImage(compLabels, compScores, compMean, 'Competency Scores vs Mean');
    doc.addImage(compImg, 'PNG', 15, 75, 180, 70); 

    const clusterLabels = clusterAverages.map(c => c.name);
    const clusterMean = clusterAverages.map(c => c.avg); 
    const clusterImg = await createChartImage(clusterLabels, clusterScores, clusterMean, 'Competency Clusters vs Mean');
    doc.addImage(clusterImg, 'PNG', 15, 150, 180, 70);

    // COMMENTS
    if (comments && comments.length > 0) {
      let yPos = 230; 
      doc.setFontSize(11);
      doc.setTextColor(0, 90, 156); 
      doc.text("Comments (if any):", 15, yPos);
      yPos += 6;

      doc.setFontSize(9); 
      doc.setTextColor(50, 50, 50); 
      
      comments.forEach(comment => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20; 
        }
        const splitComment = doc.splitTextToSize(`• ${comment}`, 180); 
        doc.text(splitComment, 15, yPos);
        yPos += (splitComment.length * 4.5) + 2; 
      });
    } else {
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("No assessor comments provided for this candidate.", 15, 230);
    }
  };

  // 3. Single PDF Generator (For the table button)
  const generatePDF = async (candidate) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    await buildCandidateReport(doc, candidate);
    doc.save(`${candidate['Names'].trim()}_Report.pdf`);
  };

  // 4. Bulk PDF Generator (For the Top 70 button)
const generateBulkPDF = async (candidatesList, filename) => {
    setIsGeneratingBulk(true); 
    const doc = new jsPDF('p', 'mm', 'a4');
    
    for (let i = 0; i < candidatesList.length; i++) {
      if (i > 0) doc.addPage(); 
      await buildCandidateReport(doc, candidatesList[i]);
    }
    
    doc.save(filename); // <--- Now it uses the correct name!
    setIsGeneratingBulk(false); 
  };

  // Generic Download Function
  const downloadCSV = (dataToDownload, filename) => {
    const formattedData = dataToDownload.map(row => ({
      ...row,
      'Cgpa Weightage (20%)': row['Cgpa Weightage (20%)'].toFixed(2),
      'Screening Interview(15%)': row['Screening Interview(15%)'].toFixed(2),
      'Test Score/ Role Fit (25%)': row['Test Score/ Role Fit (25%)'].toFixed(2),
      'AC Percentile': row['AC Percentile'].toFixed(2) + '%',
      'AC Weightage (40%)': row['AC Weightage (40%)'].toFixed(2),
      'Total Score': row['Total Score'].toFixed(2)
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const masterColumns = [
    { label: 'S.No', key: 'sno' }, { label: 'Full Name', key: 'Full Name' },
    { label: 'Location', key: 'Preferred location for Assessment Center' }, { label: 'CNIC', key: 'CNIC' },
    { label: 'Mobile Number', key: 'Mobile Number' }, { label: 'University', key: 'University' },
    { label: 'City of Residence', key: 'City of Residence' }, { label: 'Degree', key: 'Graduate Degree - Majors (Eg: BBA-HR)' },
    { label: 'Specialization', key: 'Specialization' }, { label: 'Status', key: 'Status' }
  ];

  const finalResultColumns = [
    'Print Report', 'Final Rank', 'AC Rank', 'Names', 'Star Candidate', 'CNIC', 'University', 'Email', 'Mobile', 'City of Residence', 
    'Graduate Degree', 'Cgpa', 'Cgpa Weightage (20%)', 'Screening Interview', 'Screening Interview(15%)', 
    'Test Score/Role Fit', 'Test Score/ Role Fit (25%)', 'AC Percentile', 'AC Weightage (40%)', 'Total Score'
  ];

  const assessmentColumns = assessmentData.length > 0 ? Object.keys(assessmentData[0]) : [];

  // Derived Data for Tabs 5 and 6
  const top70Candidates = finalResults.slice(0, 70);
  const starCandidatesList = finalResults.filter(row => starCnics.has(row.CNIC));

  // Reusable Table Component for Results
const renderResultsTable = (dataArray) => (
    <Paper sx={{ width: '100%', overflow: 'hidden', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 160px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {finalResultColumns.map((col, idx) => (
                <TableCell key={idx} sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0', whiteSpace: 'nowrap' }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataArray.map((row, index) => (
              <TableRow hover key={index}>
                {finalResultColumns.map((col, idx) => {
                  let value = row[col];
                  
                  // 1. Render Print Button
                  if (col === 'Print Report') {
                    return (
                      <TableCell key={idx} sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title="Download PDF Report">
                          <IconButton color="primary" onClick={() => generatePDF(row)}>
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    );
                  }

                  // 2. Format numbers
                  if (typeof value === 'number' && !col.includes('Rank')) {
                    value = value.toFixed(2);
                  }
                  if (col === 'AC Percentile') value = `${value}%`;
                  
                  // 3. Render Badges
                  if (col === 'Final Rank') {
                    return <TableCell key={idx} sx={{ whiteSpace: 'nowrap' }}><Chip label={`#${value}`} color="primary" size="small" sx={{ fontWeight: 'bold' }}/></TableCell>;
                  }
                  if (col === 'AC Rank') {
                    return <TableCell key={idx} sx={{ whiteSpace: 'nowrap' }}><Chip label={`#${value}`} color="secondary" size="small" sx={{ fontWeight: 'bold' }}/></TableCell>;
                  }
                  if (col === 'Star Candidate') {
                    return (
                      <TableCell key={idx} sx={{ whiteSpace: 'nowrap' }}>
                        {value === 'Yes' ? (
                          <Chip label="⭐ Star" size="small" sx={{ fontWeight: 'bold', backgroundColor: '#ffd700', color: '#000' }} />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    );
                  }

                  return <TableCell key={idx} sx={{ whiteSpace: 'nowrap' }}>{value || '-'}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

    return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
<AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#ffffff', color: '#333333', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          
          {/* Left Side: Program Titles */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: '900', color: '#005A9C', lineHeight: 1.1, textTransform: 'uppercase' }}>
              House of Habib <span style={{ color: '#B31B1B', margin: '0 4px' }}>|</span> Mission Believe
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#555', letterSpacing: 1.5, fontSize: '0.8rem', textTransform: 'uppercase', mt: 0.5 }}>
              Graduate Trainee Program 2026
            </Typography>
          </Box>

          {/* Right Side: Tagline and Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 1 }}>
            <Typography sx={{ color: '#B31B1B', fontWeight: 'bold', fontStyle: 'italic', fontSize: '1.1rem' }}>
              Convey Meaning. Create Significance.
            </Typography>
            <img src="/logo.png" alt="HOH Logo" style={{ height: '45px', objectFit: 'contain' }} />
          </Box>

        </Toolbar>
      </AppBar>

<Drawer 
        variant="permanent" 
        sx={{ 
          width: drawerWidth, 
          flexShrink: 0, 
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: '#005A9C', // HOH Blue
            color: '#ffffff', // White text
            borderRight: 'none'
          } 
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {[
              { text: 'Master Sheet', icon: <PeopleIcon />, index: 0 },
              { text: 'Assessment Results', icon: <AssessmentIcon />, index: 1 },
              { text: 'Averages & Analytics', icon: <BarChartIcon />, index: 2 },
              { text: 'Assessor Stats', icon: <AssignmentIndIcon />, index: 3 },
              { text: 'Final Results', icon: <EmojiEventsIcon />, index: 4 },
              { text: 'Top 70 Candidates', icon: <WorkspacePremiumIcon />, index: 5 },
              { text: 'Star Candidates', icon: <StarsIcon />, index: 6 },
            ].map((item) => (
              <ListItem disablePadding key={item.index}>
                <ListItemButton 
                  selected={activeTab === item.index} 
                  onClick={() => setActiveTab(item.index)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)', // Light highlight for active tab
                      borderLeft: '4px solid #FFD700' // Gold accent line
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: activeTab === item.index ? '#FFD700' : '#ffffff' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontWeight: activeTab === item.index ? 'bold' : 'normal' }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
        ) : (
          <>
            {/* TAB 0 & 1: TABLES */}
            {(activeTab === 0 || activeTab === 1) && (
              <Paper sx={{ width: '100%', overflow: 'hidden', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 120px)' }}>
                  <Table stickyHeader size="small">
                    {activeTab === 0 && (
                      <>
                        <TableHead><TableRow>{masterColumns.map((col, idx) => (<TableCell key={idx} sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0', whiteSpace: 'nowrap' }}>{col.label}</TableCell>))}</TableRow></TableHead>
                        <TableBody>
                          {masterData.map((row, index) => (
                            <TableRow hover key={index}>
                              {masterColumns.map((col, idx) => {
                                if (col.key === 'sno') return <TableCell key={idx}>{index + 1}</TableCell>;
                                if (col.key === 'Status') return <TableCell key={idx}><Chip label={row.Status} color={row.Status === 'Present' ? 'success' : 'error'} size="small" sx={{ fontWeight: 'bold' }} /></TableCell>;
                                return <TableCell key={idx} sx={{ whiteSpace: 'nowrap' }}>{row[col.key] || '-'}</TableCell>;
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </>
                    )}
                    {activeTab === 1 && (
                      <>
                        <TableHead><TableRow><TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>S.No</TableCell>{assessmentColumns.map((col, idx) => (<TableCell key={idx} sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0', whiteSpace: 'nowrap' }}>{col}</TableCell>))}</TableRow></TableHead>
                        <TableBody>
                          {assessmentData.map((row, index) => (
                            <TableRow hover key={index}><TableCell>{index + 1}</TableCell>{assessmentColumns.map((col, idx) => (<TableCell key={idx} sx={{ whiteSpace: 'nowrap' }}>{row[col] || '-'}</TableCell>))}</TableRow>
                          ))}
                        </TableBody>
                      </>
                    )}
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* TAB 2: AVERAGES */}
            {activeTab === 2 && (
              <Box sx={{ overflowY: 'auto', height: '100%', pb: 5 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>Assessment Center Averages</Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Card elevation={3}><CardContent><Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>Average by Competency</Typography>
                        <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow sx={{ backgroundColor: '#f0f0f0' }}><TableCell sx={{ fontWeight: 'bold' }}>Competency</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>Average Score</TableCell></TableRow></TableHead><TableBody>{competencyAverages.map((comp, idx) => (<TableRow key={idx}><TableCell>{comp.name}</TableCell><TableCell align="right"><Chip label={`${comp.avg} / 4`} color="primary" variant="outlined" size="small" sx={{ fontWeight: 'bold' }} /></TableCell></TableRow>))}</TableBody></Table></TableContainer>
                    </CardContent></Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#9c27b0', fontWeight: 'bold' }}>
                          Average by Competency Cluster
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Cluster Name</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Average Score</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {clusterAverages.map((cluster, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{cluster.name}</TableCell>
                                  <TableCell align="right">
                                    <Chip 
                                      label={`${cluster.avg} / ${cluster.max}`} 
                                      color="secondary" 
                                      variant="outlined" 
                                      size="small" 
                                      sx={{ fontWeight: 'bold' }} 
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TAB 3: ASSESSOR STATS */}
            {activeTab === 3 && (
              <Box sx={{ overflowY: 'auto', height: '100%', pb: 5 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>Assessor Statistics</Typography>
                <Card elevation={3} sx={{ maxWidth: 800 }}><CardContent><TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 'calc(100vh - 250px)' }}><Table stickyHeader size="small"><TableHead><TableRow><TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>S.No</TableCell><TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Assessor Name</TableCell><TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Mean</TableCell><TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Standard Deviation (SD)</TableCell></TableRow></TableHead><TableBody>{assessorStats.sort((a, b) => a.name.localeCompare(b.name)).map((assessor, idx) => (<TableRow hover key={idx}><TableCell>{idx + 1}</TableCell><TableCell>{assessor.name}</TableCell><TableCell align="right">{assessor.mean}</TableCell><TableCell align="right">{assessor.sd}</TableCell></TableRow>))}</TableBody></Table></TableContainer></CardContent></Card>
              </Box>
            )}

            {/* TAB 4: FINAL RESULTS */}
            {activeTab === 4 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>Final Rankings & Results</Typography>
                  <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={() => downloadCSV(finalResults, 'Final_Rankings_2026.csv')}>
                    Download Final Results
                  </Button>
                </Box>
                {renderResultsTable(finalResults)}
              </Box>
            )}

            {/* TAB 5: TOP 70 CANDIDATES */}
            {activeTab === 5 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>Top 70 Candidates</Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* NEW BULK PDF BUTTON */}
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={isGeneratingBulk ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />} 
                      onClick={() => generateBulkPDF(top70Candidates, 'Top_70_Candidates_Reports.pdf')}
                      disabled={isGeneratingBulk}
                    >
                      {isGeneratingBulk ? 'Generating PDFs...' : 'Download All Reports (PDF)'}
                    </Button>

                    {/* EXISTING CSV BUTTON */}
                    <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={() => downloadCSV(top70Candidates, 'Top_70_Candidates.csv')}>
                      Download Top 70 CSV
                    </Button>
                  </Box>

                </Box>
                {renderResultsTable(top70Candidates)}
              </Box>
            )}
            
            {/* TAB 6: STAR CANDIDATES */}
            {activeTab === 6 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>Star Candidates</Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* NEW BULK PDF BUTTON FOR STAR CANDIDATES */}
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={isGeneratingBulk ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />} 
                      onClick={() => generateBulkPDF(starCandidatesList)}
                      disabled={isGeneratingBulk}
                    >
                      {isGeneratingBulk ? 'Generating PDFs...' : 'Download All Reports (PDF)'}
                    </Button>

                    {/* EXISTING CSV BUTTON */}
                    <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={() => downloadCSV(starCandidatesList, 'Star_Candidates.csv')}>
                      Download Star Candidates CSV
                    </Button>
                  </Box>

                </Box>
                {renderResultsTable(starCandidatesList)}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;