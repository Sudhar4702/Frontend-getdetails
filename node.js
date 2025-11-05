const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 5000; // eg things

const POWERSHELL_SCRIPT_PATH = 'C:\\Scripts\\Get-ADUser-Details.ps1';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/api/get-user-details', (req, res) => {
    const username = req.query.user ? req.query.user.trim() : '';

    if (!username) {
        return res.status(400).json({ success: false, message: "Missing required 'user' query parameter." });
    }

    console.log(`Received request for user: ${username}`);

    const command = `powershell.exe -ExecutionPolicy Bypass -NoProfile -File "${POWERSHELL_SCRIPT_PATH}" -SamAccountName "${username}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec Error: ${error.message}`);
            return res.status(500).json({ 
                success: false, 
                message: `Backend Execution Failed: ${error.message}` 
            });
        }
        
        if (stderr) {
            console.warn(`PowerShell Stderr (Warning/Error): ${stderr}`);
        }

        try {
            const scriptOutput = JSON.parse(stdout.trim());

            if (scriptOutput.success) {
                res.status(200).json(scriptOutput);
            } else {
                const statusCode = scriptOutput.message.includes('not found') ? 404 : 500;
                res.status(statusCode).json(scriptOutput);
            }

        } catch (e) {
            console.error(`JSON Parsing Error: ${e.message}. Raw Output: ${stdout}`);
            res.status(500).json({ 
                success: false, 
                message: `Failed to parse script output. Raw text: ${stdout.substring(0, 100)}...` 
            });
        }
    });
});

// java script

        async function fetchUserDetails(username) {
            document.getElementById('resultsArea').style.display = 'none';
            showMessage(`🚀 Querying backend for ${username}...`, 'loading');
            toggleLoading(true);
            const apiUrl = `http://YOUR_SERVER_IP_OR_HOSTNAME:5000/api/get-user-details?user=${username}`;
            
            try {
                const response = await fetch(apiUrl);
                const data = await response.json(); 

                toggleLoading(false);

                if (data.success) {
                    hideMessage();
                    displayResults(username, data.UserAccount, data.Groups);
                } else {
                    showMessage(data.message, 'error');
                    document.getElementById('resultsArea').style.display = 'none';
                }

            } catch (error) {
                console.error("Fetch error:", error);
                toggleLoading(false);
                showMessage("❌ Network Error: Could not connect to the backend server (Check Node.js server and port 5000).", 'error');
            }
        }