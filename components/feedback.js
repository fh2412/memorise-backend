// feedback.js
const express = require('express');
const router = express.Router();
const { Octokit } = require('@octokit/rest'); // ✅ Use this in CommonJS
require('dotenv').config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const GITHUB_OWNER = "fh2412";
const GITHUB_REPO = "memorise-ns";

router.post('/new', async (req, res) => {
  const { title, description, type, email } = req.body;

  if (!title || !description || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const issueBody = `
## Feedback Details
- **Type**: ${type}
- **Submitted By**: ${email || 'Anonymous'}
- **Timestamp**: ${new Date().toISOString()}

## Description
${description}

---
*This issue was automatically created from user feedback in the beta application.*
  `;

  const labels = ['feedback'];
  switch (type) {
    case 'bug': labels.push('bug'); break;
    case 'feature': labels.push('enhancement'); break;
    case 'improvement': labels.push('improvement'); break;
    default: labels.push('question');
  }

  try {
    const response = await octokit.rest.issues.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: `[FEEDBACK] ${title}`,
      body: issueBody,
      labels: labels
    });

    return res.status(201).json({
      success: true,
      issueUrl: response.data.html_url,
      issueNumber: response.data.number
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to create issue' });
  }
});

router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Found!' });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
});

module.exports = router;
