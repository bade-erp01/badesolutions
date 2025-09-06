import dbConnect from '../../../../../lib/mongoose';
import {WHouse} from '../../../../../models/Stores';
import {Dencrypt} from '../../../../../Functions/Functions';
import Invoice from '../../../../../models/Invoices'
import { ObjectId } from 'mongodb';
import axios from "axios"


// Simple in-memory cache
const cache = new Map();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { whId, category = 'all', page = '1', limit = '10' } = req.query;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const tenantId = authHeader.split(' ')[1];
  const cacheKey = `${tenantId}-${whId}-${category}-${page}-${limit}`;
  const now = Date.now();

  // Check cache
  if (cache.has(cacheKey)) {
    const { timestamp, data } = cache.get(cacheKey);
    if (now - timestamp < 2 * 60 * 1000) {
      return res.status(200).json(data);
    }
    cache.delete(cacheKey); // Expired
  }

  try {
    await dbConnect();

    if (!ObjectId.isValid(Dencrypt(whId))) {
      return res.status(400).json({ error: 'Invalid warehouse ID' });
    }

    const warehouse = await WHouse.findOne({ _id: Dencrypt(whId) }).lean();
    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const allBills = await Invoice.findByTenant(tenantId, {
      $and: [{ billStatus: { $ne: "Draft" } }, { whId: warehouse._id }],
    })
      .sort({ billReferenceNo: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const filteredBills = category === 'all'
      ? allBills
      : allBills.filter(bill => bill.billStatus.toLowerCase() === category.toLowerCase());

    const totalCount = await Invoice.findByTenant(tenantId).countDocuments();

    const PendingOrders = await Invoice.findByTenant(tenantId, {
      $and: [{ billStatus: { $eq: "Order" } }, { whId: warehouse._id }],
    });

    const responsePayload = {
      deliveredBills: filteredBills,
      PendingOrders,
      display: 'Invoice',
      pagination: {
        currentPage: pageNum,
        currentCategory: category,
        next: pageNum * limitNum < totalCount ? { page: pageNum + 1, limit: limitNum } : null,
        previous: pageNum > 1 ? { page: pageNum - 1, limit: limitNum } : null,
      },
    };

    // Cache the response
    cache.set(cacheKey, { timestamp: now, data: responsePayload });

    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}



//post request to main server to create bill
