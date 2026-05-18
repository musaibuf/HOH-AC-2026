import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, TextField, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, 
  Button, FormControl, InputLabel, Checkbox, FormControlLabel, Box, 
  Tabs, Tab, Chip, Dialog, DialogContent, DialogActions, CircularProgress
} from '@mui/material';

const assessors = [
  "Ahmer Abdus Samad", "Ali Ayub", "Amber Agha", "Anisa Dhanani", "Dania Shahab", "Danish Arshad", 
  "Danish Owais", "Fahad Tariq Rafi", "Faisal Masood", "Faisal Muneeb", "Farrukh Shafiq", "Haider Ali Taj", 
  "Hareem Humail", "Hiba Saeed", "Hina Qureshi", "Hira Azhar", "Iraj Mustafa", "Kamran Z. Rizvi", 
  "Kanza Afzal", "Kashif Rahim", "Mohsin Ahmed", "Mohsin Siddiqui", "Muhammad Sumair", "Omair Mazhar Qureshi", 
  "Omer Qasim", "Owais Magrabi", "Qamber Rizvi", "Quaid Khan", "Rai Adil Zubair", "Rameez Asif", 
  "Rameez Asif Siddiqui", "Rhonda Fernandes", "Saad Ullah", "Sabika Haider", "Saeed Ahmed", "Salman Afzal", 
  "Sameer Amlani", "Sarmad Qureshi", "Sumair Shafiq", "Umair Ali Bhatti", "Uraib Ahmed", "Usman Ahmed Khan", 
  "Usama Razzaque", "Waqar Ali Baloch", "Wajahat Hussain", "Waleed Anwar", "Waleed Faridi", "Zaid Imad", 
  "Zeeshan Shahid", "Zohair Islam", "Zunair Khan"
];

const assessmentData = [
  { round: 'Battle of Wesnoth', competencies: ['Business Acumen', 'Individual Acumen', 'Problem Solving', 'Decision Making', 'Interpersonal Savy', 'Stakeholder Management', 'Teamwork & Collaboration', 'Achievement Focus', 'Commitment to Process Improvement'] },
  { round: 'The Ultimate Resource Challenge', competencies: ['Individual Acumen', 'Problem Solving', 'Decision Making', 'Interpersonal Savy', 'Developing Others', 'Teamwork & Collaboration', 'Customer Focus', 'Achievement Focus', 'Commitment to Process Improvement'] },
  { round: 'Conflict Roleplays', competencies: ['Individual Acumen', 'Problem Solving', 'Decision Making', 'Interpersonal Savy', 'Stakeholder Management', 'Teamwork & Collaboration', 'Achievement Focus'] }
];

const emptyAssessor = { assessor: '', ratings: {}, comments: '', starCandidate: false };
const emptyShared = { candidate: null, date: '', batch: '' };
const totalCompetencies = assessmentData.reduce((sum, r) => sum + r.competencies.length, 0);
const countFilled = (ratings) => Object.values(ratings).filter(v => v !== '').length;

// Parse CSV — trims ALL headers and values
const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = [];
    let cur = '';
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { cols.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    if (cols.length >= 3) {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (cols[idx] || '').trim(); });
      rows.push(obj);
    }
  }
  return rows;
};

// Fuzzy field getter — handles whitespace mismatches in header names
const getField = (obj, name) => {
  if (!obj) return '';
  if (obj[name] !== undefined) return obj[name];
  const key = Object.keys(obj).find(k => k.trim().toLowerCase() === name.trim().toLowerCase());
  return key ? obj[key] : '';
};

const CandidateSearch = ({ candidates, selected, onSelect }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filtered = query.length < 1 ? [] : candidates.filter(c => {
    const name = getField(c, 'Full Name').toLowerCase();
    const cnic = getField(c, 'CNIC').replace(/-/g, '');
    const uni = getField(c, 'University').toLowerCase();
    const q = query.toLowerCase();
    return name.includes(q) || cnic.includes(query.replace(/-/g, '')) || uni.includes(q);
  }).slice(0, 10);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (c) => { onSelect(c); setOpen(false); };
  const handleClear = () => { onSelect(null); setQuery(''); setOpen(false); };

  return (
    <Box ref={wrapperRef} sx={{ flex: 2, minWidth: 220, position: 'relative' }}>
      <TextField
        fullWidth
        label="Search Candidate"
        placeholder="Type name, CNIC, or university..."
        value={selected ? getField(selected, 'Full Name') : query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onSelect(null); }}
        onFocus={() => { if (!selected) setOpen(true); }}
        InputProps={{
          endAdornment: selected ? (
            <Button size="small" onClick={handleClear} sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}>✕</Button>
          ) : null
        }}
      />

      {selected && (
        <Box sx={{ mt: 1, p: 1.5, borderRadius: 1, backgroundColor: '#e3f2fd', border: '1px solid #90caf9' }}>
          <Typography variant="body2" fontWeight="bold">{getField(selected, 'Full Name')}</Typography>
          <Typography variant="caption" color="text.secondary">
            CNIC: {getField(selected, 'CNIC') || '—'} &nbsp;|&nbsp; {getField(selected, 'University') || '—'}
          </Typography>
        </Box>
      )}

      {open && filtered.length > 0 && (
        <Paper elevation={4} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300, maxHeight: 280, overflowY: 'auto', mt: 0.5, borderRadius: 1 }}>
          {filtered.map((c, i) => (
            <Box key={i} onClick={() => handleSelect(c)} sx={{ px: 2, py: 1.5, cursor: 'pointer', borderBottom: '1px solid #f0f0f0', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <Typography variant="body2" fontWeight="bold">{getField(c, 'Full Name')}</Typography>
              <Typography variant="caption" color="text.secondary">
                CNIC: {getField(c, 'CNIC') || '—'} &nbsp;|&nbsp; {getField(c, 'University') || '—'}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}

      {open && query.length > 0 && filtered.length === 0 && (
        <Paper elevation={4} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300, mt: 0.5, borderRadius: 1 }}>
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" color="text.secondary">No candidates found</Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

const AssessmentForm = () => {
  const [candidates, setCandidates] = useState([]);
  const [loadingCSV, setLoadingCSV] = useState(true);
  const [csvError, setCsvError] = useState(false);
  const [shared, setShared] = useState({ ...emptyShared });
  const [activeTab, setActiveTab] = useState(0);
  const [assessorData, setAssessorData] = useState([{ ...emptyAssessor }, { ...emptyAssessor }]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch('/mastersheet.csv')
      .then(res => { if (!res.ok) throw new Error('CSV not found'); return res.text(); })
      .then(text => { setCandidates(parseCSV(text)); setLoadingCSV(false); })
      .catch(() => { setCsvError(true); setLoadingCSV(false); });
  }, []);

  const handleSharedChange = (e) => {
    const { name, value } = e.target;
    setShared(prev => ({ ...prev, [name]: value }));
  };

  const handleAssessorField = (tabIdx, field, value) => {
    setAssessorData(prev => {
      const updated = [...prev];
      updated[tabIdx] = { ...updated[tabIdx], [field]: value };
      return updated;
    });
  };

  const handleRatingChange = (tabIdx, round, comp, value) => {
    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 4)) {
      setAssessorData(prev => {
        const updated = [...prev];
        updated[tabIdx] = { ...updated[tabIdx], ratings: { ...updated[tabIdx].ratings, [`${round}-${comp}`]: value } };
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    const candidateObj = shared.candidate ? {
      'Full Name': getField(shared.candidate, 'Full Name'),
      'CNIC': getField(shared.candidate, 'CNIC'),
      'University': getField(shared.candidate, 'University'),
    } : null;

    const payload = {
      shared: { candidate: candidateObj, date: shared.date, batch: shared.batch },
      assessorData: assessorData.map(a => ({
        assessor: a.assessor,
        starCandidate: a.starCandidate,
        comments: a.comments,
        ratings: a.ratings,
      })),
    };

    try {
      // UPDATE THIS LINE:
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const res = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      setShowSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to submit. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewResponse = () => {
    setShared({ ...emptyShared });
    setAssessorData([{ ...emptyAssessor }, { ...emptyAssessor }]);
    setActiveTab(0);
    setShowSuccess(false);
    setSubmitError('');
  };

  const isComplete = (idx) =>
    countFilled(assessorData[idx].ratings) === totalCompetencies && assessorData[idx].assessor;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Assessment Sheet</Typography>

      {/* Candidate Info */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          Candidate Info
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {loadingCSV ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">Loading candidates...</Typography>
            </Box>
          ) : csvError ? (
            <Box sx={{ flex: 2 }}>
              <Typography variant="body2" color="error">⚠ Could not load mastersheet.csv — make sure it's in the /public folder.</Typography>
            </Box>
          ) : (
            <CandidateSearch
              candidates={candidates}
              selected={shared.candidate}
              onSelect={(c) => setShared(prev => ({ ...prev, candidate: c }))}
            />
          )}

          <Box sx={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column' }}>
            <Typography component="label" htmlFor="date-input" sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5, ml: '14px' }}>Date</Typography>
            <input
              id="date-input" type="date" name="date" value={shared.date} onChange={handleSharedChange}
              style={{ height: '56px', padding: '0 14px', fontSize: '1rem', border: '1px solid #c4c4c4', borderRadius: '4px', outline: 'none', fontFamily: 'inherit', color: '#333', backgroundColor: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1976d2'}
              onBlur={e => e.target.style.borderColor = '#c4c4c4'}
            />
          </Box>

          <FormControl sx={{ flex: 1, minWidth: 130 }}>
            <InputLabel id="batch-label">Batch</InputLabel>
            <Select labelId="batch-label" name="batch" label="Batch" value={shared.batch} onChange={handleSharedChange} defaultValue="">
              <MenuItem value="Morning">Morning</MenuItem>
              <MenuItem value="Afternoon">Afternoon</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Assessor Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          {[0, 1].map(idx => (
            <Tab key={idx} label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Assessor {idx + 1}{assessorData[idx].assessor ? ` — ${assessorData[idx].assessor.split(' ')[0]}` : ''}</span>
                {isComplete(idx)
                  ? <Chip label="Done" color="success" size="small" />
                  : assessorData[idx].assessor
                    ? <Chip label={`${countFilled(assessorData[idx].ratings)}/${totalCompetencies}`} color="warning" size="small" />
                    : null}
              </Box>
            } />
          ))}
        </Tabs>
      </Box>

      {/* Per-assessor panels */}
      {[0, 1].map(idx => (
        <Box key={idx} hidden={activeTab !== idx}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id={`assessor-label-${idx}`}>Assessor Name</InputLabel>
              <Select
                labelId={`assessor-label-${idx}`}
                label="Assessor Name"
                value={assessorData[idx].assessor}
                onChange={e => handleAssessorField(idx, 'assessor', e.target.value)}
                defaultValue=""
              >
                {assessors
                  .filter(name => name !== assessorData[idx === 0 ? 1 : 0].assessor)
                  .map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Checkbox checked={assessorData[idx].starCandidate} onChange={e => handleAssessorField(idx, 'starCandidate', e.target.checked)} />}
              label="Star Candidate"
              sx={{ whiteSpace: 'nowrap' }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#1976d2' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}><b>Round</b></TableCell>
                  <TableCell sx={{ color: 'white' }}><b>Competency</b></TableCell>
                  <TableCell sx={{ color: 'white' }} align="center"><b>Rating (1-4)</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessmentData.map((roundObj) =>
                  roundObj.competencies.map((comp, compIdx) => (
                    <TableRow key={`${roundObj.round}-${comp}`} hover>
                      <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>{compIdx === 0 ? <b>{roundObj.round}</b> : ''}</TableCell>
                      <TableCell>{comp}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number" size="small" inputProps={{ min: 1, max: 4 }} sx={{ width: 60 }}
                          value={assessorData[idx].ratings[`${roundObj.round}-${comp}`] || ''}
                          onChange={e => handleRatingChange(idx, roundObj.round, comp, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TextField
            fullWidth label="Comments (If any)" multiline rows={3} variant="outlined"
            value={assessorData[idx].comments}
            onChange={e => handleAssessorField(idx, 'comments', e.target.value)}
            sx={{ mb: 2 }}
          />

          {idx === 0 && (
            <Button variant="outlined" onClick={() => setActiveTab(1)}>Next → Assessor 2</Button>
          )}
        </Box>
      ))}

      {/* Submit row */} 
      <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained" size="large" onClick={handleSubmit}
          disabled={!shared.candidate || !isComplete(0) || !isComplete(1) || submitting}
        >
          {submitting ? <><CircularProgress size={18} sx={{ mr: 1, color: 'white' }} /> Submitting...</> : 'Submit Both Assessor Sheets'}
        </Button>

        {(!shared.candidate || !isComplete(0) || !isComplete(1)) && !submitting && (
          <Typography variant="body2" color="text.secondary">
            {!shared.candidate ? 'Select a candidate. ' : ''}
            {!isComplete(0) ? 'Assessor 1 incomplete. ' : ''}
            {!isComplete(1) ? 'Assessor 2 incomplete.' : ''}
          </Typography>
        )}

        {submitError && (
          <Typography variant="body2" color="error">⚠ {submitError}</Typography>
        )}
      </Box>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onClose={() => {}} PaperProps={{ sx: { borderRadius: 3, p: 2, maxWidth: 420, textAlign: 'center' } }}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 4 }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 44, lineHeight: 1, color: '#4caf50' }}>✓</Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold">Responses Recorded!</Typography>
          <Typography variant="body1" color="text.secondary">
            Assessment for <strong>{getField(shared.candidate, 'Full Name')}</strong> has been successfully submitted by both assessors.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" size="large" onClick={handleNewResponse} sx={{ px: 4, borderRadius: 2 }}>
            Submit New Response
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssessmentForm;