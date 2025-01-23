import express from 'express';
import cors from 'cors';
import { query, validationResult } from 'express-validator';
import { Client, Databases, ID, Query } from 'appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Appwrite
const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

// Database constants from environment variables
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;
const CAMPAIGNS_COLLECTION_ID = process.env.VITE_APPWRITE_COLLECTION_CAMPAIGNS;
const CUSTOMERS_COLLECTION_ID = process.env.VITE_APPWRITE_COLLECTION_CUSTOMERS;

// Middleware
app.use(cors());
app.use(express.json());

// Validation middleware
const validateCampaign = [
  query('campaign_name').isString().notEmpty().trim(),
  query('start_date').isISO8601().toDate().notEmpty(),
  query('end_date').isISO8601().toDate().notEmpty(),
  query('budget').isNumeric(),
  query('status').isIn(['active', 'paused', 'completed', 'onboarded']),
  query('campaign_type').isString().notEmpty(),
  query('ad_type').isIn(['in-app', 'web-contextual', 'd-ooh', 'ar-vr']),
  query('ad_platform').isString().notEmpty(),
  query('target_type').isString().notEmpty(),
  query('target_kpi').isString().notEmpty(),
  query('target_event').isString().notEmpty(),
  query('targeting').isString().notEmpty(),
];

// POST endpoint to create a campaign
app.post('/api/campaigns/:email', validateCampaign, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.params;
    const campaignData = {
      campaign_name: req.query.campaign_name,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      budget: Number(req.query.budget),
      status: req.query.status,
      campaign_type: req.query.campaign_type,
      ad_type: req.query.ad_type,
      ad_platform: req.query.ad_platform,
      target_type: req.query.target_type,
      target_kpi: req.query.target_kpi,
      target_event: req.query.target_event,
      targeting: req.query.targeting,
    };

    // Get user from Customers collection using email
    const customersResponse = await databases.listDocuments(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      [Query.equal('email', email)]
    );

    if (customersResponse.documents.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customersResponse.documents[0];

    // Create campaign document
    const campaign = await databases.createDocument(
      DATABASE_ID,
      CAMPAIGNS_COLLECTION_ID,
      ID.unique(),
      {
        ...campaignData,
        user_id: customer.user_id,
        customers: customer.user_id,
      }
    );

    // Return success response with animated message
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully!',
      data: campaign,
      animation: {
        type: 'success',
        duration: 3000,
      },
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message,
    });
  }
});

// Listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});