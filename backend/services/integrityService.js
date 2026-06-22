const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Claim = require('../models/Claim');
const logger = require('../utils/logger');
const Groq = require('groq-sdk');

let groq = null;
if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

/**
 * Computes SHA256 hash of a file
 */
const computeFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('error', err => reject(err));
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
};

/**
 * Performs AI-powered integrity check on claim images
 */
const performIntegrityCheck = async (claimId) => {
    try {
        const claim = await Claim.findById(claimId);
        if (!claim) return;

        const issues = [];
        const imageHashes = [];

        for (const img of claim.images) {
            const fullPath = path.join(__dirname, '..', img.url);
            if (!fs.existsSync(fullPath)) {
                logger.warn(`Image file not found for claim ${claimId}: ${fullPath}`);
                continue;
            }

            const stats = fs.statSync(fullPath);

            // 1. Basic Metadata Check (Corruption / Anomaly)
            if (stats.size < 5000) { // Unusually small for a high-res farm photo
                logger.warn(`Image file for claim ${claimId} is unusually small (${stats.size} bytes): ${fullPath}`);
                issues.push({
                    type: 'corrupted',
                    message: 'File size too small. Image may be corrupted or a placeholder.',
                    severity: 'high',
                    imageUrl: img.url
                });
            }
            // Add more checks here, e.g., for file type vs. size consistency if needed
            // For example, if (img.url.endsWith('.jpg') && stats.size > 10 * 1024 * 1024) { /* potentially too large for typical web use */ }


            // 2. Duplicate detection (Exact hash matching)
            const hash = await computeFileHash(fullPath);
            img.hash = hash; // Update claim with hash

            const duplicate = await Claim.findOne({
                _id: { $ne: claimId },
                'images.hash': hash
            });

            if (duplicate) {
                issues.push({
                    type: 'duplicate',
                    message: `Image used in previous claim #${duplicate._id.toString().slice(-6).toUpperCase()}`,
                    severity: 'high',
                    imageUrl: img.url
                });
            }

            // 2. Intra-claim duplicate check
            if (imageHashes.includes(hash)) {
                issues.push({
                    type: 'duplicate',
                    message: 'Same image uploaded multiple times in this claim',
                    severity: 'medium',
                    imageUrl: img.url
                });
            }
            imageHashes.push(hash);

            // 3. AI-powered manipulation/stock detection (via Groq)
            if (groq) {
                try {
                    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
                    const imageUrl = `${baseUrl}${img.url}`;

                    const aiCheck = await groq.chat.completions.create({
                        messages: [{
                            role: 'user',
                            content: [
                                { type: 'text', text: 'VERIFY IMAGE INTEGRITY. Is this image a stock photo, AI-generated, or digitally manipulated? Look for watermarks, generic lighting, pixel artifacts, or forensic anomalies. Return JSON: { "status": "clean" | "warning", "type": "stock" | "manipulated" | "ai_gen" | "none", "reason": "reason here" }' },
                                { type: 'image_url', image_url: { url: imageUrl } }
                            ]
                        }],
                        model: 'llama-3.2-11b-vision-preview',
                        response_format: { type: 'json_object' }
                    });

                    const result = JSON.parse(aiCheck.choices[0].message.content);
                    if (result.status === 'warning') {
                        issues.push({
                            type: result.type,
                            message: result.reason,
                            severity: result.type === 'manipulated' ? 'high' : 'medium',
                            imageUrl: img.url
                        });
                    }
                } catch (aiErr) {
                    logger.error(`AI Integrity check failed for ${img.url}: ${aiErr.message}`);
                }
            }
        }

        // 4. Update claim with report
        claim.integrityReport = {
            status: issues.some(i => i.severity === 'high') ? 'flagged' : (issues.length > 0 ? 'warning' : 'clean'),
            issues,
            checkedAt: new Date()
        };

        await claim.save();
        return claim.integrityReport;

    } catch (error) {
        logger.error(`Integrity service failed: ${error.message}`);
        throw error;
    }
};

module.exports = { performIntegrityCheck };
