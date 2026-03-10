// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // CTA button click handler (removed since it's now a link)

    // ATS calculator form submission
    const atsForm = document.getElementById('ats-form');
    if (atsForm) {
        atsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const resumeTextArea = document.getElementById('resume-text');
            const keywordsText = document.getElementById('keywords').value.toLowerCase();
            const keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k);
            if (keywords.length === 0) {
                alert('Please enter at least one keyword.');
                return;
            }

            function calculateScore(text) {
                const resumeText = text.toLowerCase();
                let matches = 0;
                keywords.forEach(k => {
                    const regex = new RegExp(`\\b${k}\\b`, 'g');
                    const found = resumeText.match(regex);
                    if (found) matches += found.length;
                });
                return Math.min(100, Math.round((matches / keywords.length) * 100));
            }

            const fileInput = document.getElementById('resume-file');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const text = evt.target.result || '';
                    resumeTextArea.value = text;
                    const score = calculateScore(text);
                    document.getElementById('ats-result').textContent = `Estimated ATS score: ${score}%`;
                };
                // only read as text; PDFs/DOCs will appear as gibberish but this keeps simplicity
                reader.readAsText(file);
            } else {
                const score = calculateScore(resumeTextArea.value);
                document.getElementById('ats-result').textContent = `Estimated ATS score: ${score}%`;
            }
        });
    }

    // Add some animation to the resume preview on hover
    const resumePreview = document.querySelector('.resume-preview');
    if (resumePreview) {
        resumePreview.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        resumePreview.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Todo list functionality
    const todoList = document.getElementById('todo-list');
    if (todoList) {
        const checkboxes = todoList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            // Load saved state
            const saved = localStorage.getItem(`todo-${index}`);
            if (saved === 'true') {
                checkbox.checked = true;
            }
            // Save state on change
            checkbox.addEventListener('change', function() {
                localStorage.setItem(`todo-${index}`, this.checked);
            });
        });
    }
});