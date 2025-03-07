module.exports = {
    async compareFaces(req, res) {
        try {
            let imagem1, imagem2;

            // Case 1: Handle multipart form data (files)
            if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
                const result = await parseMultipartData(req);

                for (const part of result) {
                    if (part.name === 'imagem1' && part.data) {
                        imagem1 = part.data.toString('base64');
                    } else if (part.name === 'imagem2' && part.data) {
                        imagem2 = part.data.toString('base64');
                    }
                }
            }
            // Case 2: Handle JSON body
            else if (req.body) {
                // Extract from body - might be direct base64, URLs, or some other format
                ({ imagem1, imagem2 } = req.body);
            }
            // Case 3: Handle URL query parameters
            else if (req.query && (req.query.imagem1 || req.query.imagem2)) {
                imagem1 = req.query.imagem1;
                imagem2 = req.query.imagem2;
            }

            // Process imagem1 based on what was provided
            if (imagem1) {
                // If it's a URL, fetch and convert to base64
                if (typeof imagem1 === 'string' && imagem1.startsWith('http')) {
                    imagem1 = await fetchBase64(imagem1);
                }
                // If it's a Buffer object, convert to base64
                else if (Buffer.isBuffer(imagem1)) {
                    imagem1 = imagem1.toString('base64');
                }
                // If it's a string but not base64, try to convert it
                else if (typeof imagem1 === 'string' && !isBase64(imagem1) && !imagem1.startsWith('data:')) {
                    // Might be plain string or binary data
                    imagem1 = Buffer.from(imagem1).toString('base64');
                }
                // If it's a data URL, extract the base64 part
                else if (typeof imagem1 === 'string' && imagem1.startsWith('data:')) {
                    imagem1 = imagem1.split(',')[1];
                }
            }

            // Process imagem2 based on what was provided (same logic as imagem1)
            if (imagem2) {
                // If it's a URL, fetch and convert to base64
                if (typeof imagem2 === 'string' && imagem2.startsWith('http')) {
                    imagem2 = await fetchBase64(imagem2);
                }
                // If it's a Buffer object, convert to base64
                else if (Buffer.isBuffer(imagem2)) {
                    imagem2 = imagem2.toString('base64');
                }
                // If it's a string but not base64, try to convert it
                else if (typeof imagem2 === 'string' && !isBase64(imagem2) && !imagem2.startsWith('data:')) {
                    // Might be plain string or binary data
                    imagem2 = Buffer.from(imagem2).toString('base64');
                }
                // If it's a data URL, extract the base64 part
                else if (typeof imagem2 === 'string' && imagem2.startsWith('data:')) {
                    imagem2 = imagem2.split(',')[1];
                }
            }

            // Validate that we have both images in base64 format
            if (!imagem1 || !imagem2) {
                return res.status(400).json({ error: 'Both images are required' });
            }

            // Make the request to the API that only accepts Base64
            const apiResponse = await fetch('https://prod-27.brazilsouth.logic.azure.com/workflows/3854da61058b44aa9e5e466d3743beb1/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Xl9vvSmw2K2CAJP0QP_aunHpO9-5I8fewFEDLKGHaXA', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagem1, imagem2 })
            });

            const data = await apiResponse.json();
            res.json(data);
        } catch (error) {
            console.error('Error in compareFaces:', error);
            res.status(500).json({ error: error.message });
        }
    },

    async get(req, res) {
        res.json({ message: "Universal image comparison API is running" });
    }
};

// Helper function to parse multipart form data
async function parseMultipartData(req) {
    return new Promise((resolve, reject) => {
        const result = [];
        const chunks = [];

        req.on('data', (chunk) => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            try {
                const buffer = Buffer.concat(chunks);

                // Get boundary from content-type
                const boundary = req.headers['content-type']
                    .split('boundary=')[1]
                    .trim();

                // Find all parts
                const parts = [];
                const boundaryBuffer = Buffer.from(`--${boundary}`);
                const endBoundaryBuffer = Buffer.from(`--${boundary}--`);

                let position = 0;
                const boundaryPositions = [];

                // Find boundary positions
                while (position < buffer.length) {
                    const boundaryIndex = buffer.indexOf(boundaryBuffer, position);
                    if (boundaryIndex === -1) break;

                    boundaryPositions.push(boundaryIndex);
                    position = boundaryIndex + boundaryBuffer.length;
                }

                // Add end boundary position
                const endBoundaryPosition = buffer.indexOf(endBoundaryBuffer);
                if (endBoundaryPosition !== -1) {
                    boundaryPositions.push(endBoundaryPosition);
                }

                // Process each part
                for (let i = 0; i < boundaryPositions.length - 1; i++) {
                    const start = boundaryPositions[i] + boundaryBuffer.length;
                    const end = boundaryPositions[i + 1];

                    if (start >= end) continue;

                    // Extract part data
                    const partBuffer = buffer.slice(start, end);

                    // Find headers end
                    const headerEndIndex = partBuffer.indexOf(Buffer.from('\r\n\r\n'));
                    if (headerEndIndex === -1) continue;

                    // Get headers
                    const headersBuffer = partBuffer.slice(0, headerEndIndex);
                    const headersStr = headersBuffer.toString();

                    // Get content disposition
                    const dispositionMatch = /Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/i.exec(headersStr);
                    if (!dispositionMatch) continue;

                    const name = dispositionMatch[1];
                    const filename = dispositionMatch[2] || null;

                    // Get data (skip the \r\n\r\n)
                    const data = partBuffer.slice(headerEndIndex + 4);

                    parts.push({ name, filename, data });
                }

                resolve(parts);
            } catch (err) {
                reject(err);
            }
        });

        req.on('error', (err) => {
            reject(err);
        });
    });
}

// Helper function to download and convert URLs to base64
async function fetchBase64(url) {
    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
    } catch (error) {
        console.error(`Error fetching URL ${url}:`, error);
        throw new Error(`Failed to fetch image from URL: ${error.message}`);
    }
}

// Helper function to check if a string is base64 encoded
function isBase64(str) {
    if (typeof str !== 'string') return false;

    // Simple regex check for base64 pattern
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return base64Regex.test(str);
}