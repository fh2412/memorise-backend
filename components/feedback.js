// feedback-routes.js
const express = require('express');
const router = express.Router();
const { Octokit } = require('octokit');
require('dotenv').config();

// Initialize Octokit with your GitHub Personal Access Token


// GitHub repository details
const GITHUB_OWNER = 'fh2412';//process.env.GITHUB_OWNER;  e.g., 'your-username'
const GITHUB_REPO = 'memorise-ns';//process.env.GITHUB_REPO;    e.g., 'your-project'

// Middleware to validate feedback data
const validateFeedback = (req, res, next) => {
  const { type, title, description } = req.body;
  
  if (!type || !title || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  next();
};

// POST endpoint to receive feedback and create GitHub issue
router.post('/', validateFeedback, async (req, res) => {
  try {
    const { type, title, description, email } = req.body;
    
    // Format the issue body
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
    
    // Create issue labels based on feedback type
    const labels = ['feedback'];
    switch (type) {
      case 'bug':
        labels.push('bug');
        break;
      case 'feature':
        labels.push('enhancement');
        break;
      case 'improvement':
        labels.push('improvement');
        break;
      default:
        labels.push('question');
    }
    
    // Create the GitHub issue
    const response = await octokit.rest.issues.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: `[FEEDBACK] ${title}`,
      body: issueBody,
      labels: labels
    });
    
    // Log successful creation
    console.log(`Created GitHub issue #${response.data.number}`);
    
    // Return success response with issue info
    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      issueUrl: response.data.html_url,
      issueNumber: response.data.number
    });
    
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    
    // Return error response
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'production' 
        ? 'Server error occurred' 
        : error.message
    });
  }
});

module.exports = router;