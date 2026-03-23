document.addEventListener('DOMContentLoaded', () => {
    const emailForm = document.getElementById('emailForm');
    const otpForm = document.getElementById('otpForm');
    const emailInput = document.getElementById('emailInput');
    const otpInput = document.getElementById('otpInput');
    const messageBox = document.getElementById('messageBox');
    const backBtn = document.getElementById('backBtn');
    
    let currentEmail = '';

    function showMessage(text, type) {
        messageBox.textContent = text;
        messageBox.className = `message-box msg-${type}`;
    }

    emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email) return;

        showMessage('Sending OTP request to server...', 'info');
        
        try {
            // In a real deployed app, change this to your actual server domain
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (data.success) {
                showMessage(data.message, 'success');
                currentEmail = email;
                emailForm.style.display = 'none';
                otpForm.style.display = 'block';
                setTimeout(() => otpInput.focus(), 100);
            } else {
                showMessage(data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('Error connecting to Node server. Is it running?', 'error');
        }
    });

    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = otpInput.value.trim();
        if (!otp) return;

        showMessage('Verifying code...', 'info');
        
        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentEmail, otp })
            });
            const data = await res.json();
            
            if (data.success) {
                showMessage('Login successful! Welcome aboard.', 'success');
                // Simulate logging in and redirecting
                setTimeout(() => {
                    window.location.href = '/'; 
                }, 2000);
            } else {
                showMessage(data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('Error verifing logic. Server offline?', 'error');
        }
    });

    backBtn.addEventListener('click', () => {
        otpForm.style.display = 'none';
        emailForm.style.display = 'block';
        otpInput.value = '';
        showMessage('', '');
    });
});


