document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Logic
    const sections = document.querySelectorAll('.page-section');
    const dots = document.querySelectorAll('.dot');
    let currentPage = 1;

    window.navigateTo = (page) => {
        sections.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        document.getElementById(`page-${page}`).classList.add('active');
        const activeDot = document.querySelector(`.dot[data-page="${page}"]`);
        if (activeDot) activeDot.classList.add('active');
        
        currentPage = page;
        window.scrollTo(0, 0);

        // Trigger animations if entering specific pages
        if (page === 3) animateDashboard();
    };

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const page = parseInt(dot.getAttribute('data-page'));
            if (page <= currentPage || (page > 2 && document.getElementById('main-score-text').innerText !== '0')) {
                 navigateTo(page);
            }
        });
    });

    // 2. Calculation Logic
    window.calculateAndNavigate = () => {
        const energyCons = parseInt(document.getElementById('energy-cons').value);
        const energyEff = parseInt(document.getElementById('energy-eff').value);
        const transCong = parseInt(document.getElementById('trans-cong').value);
        const transWalk = parseInt(document.getElementById('trans-walk').value);
        const wasteSeg = parseInt(document.getElementById('waste-seg').value);
        const wastePub = parseInt(document.getElementById('waste-pub').value);
        const waterRain = parseInt(document.getElementById('water-rain').value);
        const waterLeak = parseInt(document.getElementById('water-leak').value);
        const lifePlastic = parseInt(document.getElementById('life-plastic').value);
        const lifeComm = parseInt(document.getElementById('life-comm').value);

        const totalSum = energyCons + energyEff + transCong + transWalk + wasteSeg + wastePub + waterRain + waterLeak + lifePlastic + lifeComm;
        const totalScore = Math.round(totalSum / 2);
        
        // Calculate sub-metrics for dashboard
        const pollution = 100 - ((energyCons + transCong + lifePlastic + wastePub) * 1.25);
        const happiness = (transWalk + lifeComm + (100 - transCong)) / 2 + 20;
        const efficiency = (energyEff + wasteSeg + waterRain + waterLeak) * 1.25;

        // Store globally for other pages
        window.cityData = {
            totalScore,
            pollution: Math.max(Math.min(pollution, 100), 10),
            happiness: Math.max(Math.min(happiness, 100), 10),
            efficiency: Math.max(Math.min(efficiency, 100), 10),
            inputs: { energyCons, energyEff, transCong, transWalk, wasteSeg, wastePub, waterRain, waterLeak, lifePlastic, lifeComm }
        };

        updatePulse();
        updateRecommendations();
        updatePredictions();
        updateEcoScore();
        updateSummary();
        
        navigateTo(3);
    };

    function animateDashboard() {
        const data = window.cityData;
        
        // Main Circle
        const circle = document.getElementById('score-circle');
        const offset = 408.4 - (408.4 * data.totalScore) / 100;
        circle.style.strokeDashoffset = offset;
        
        // Count up text
        animateValue("main-score-text", 0, data.totalScore, 1500);

        // Bars
        setTimeout(() => {
            document.getElementById('poll-bar').style.width = `${data.pollution}%`;
            document.getElementById('happ-bar').style.width = `${data.happiness}%`;
            document.getElementById('eff-bar').style.width = `${data.efficiency}%`;
            
            document.getElementById('poll-val').innerText = `${Math.round(data.pollution)}%`;
            document.getElementById('happ-val').innerText = `${Math.round(data.happiness)}%`;
            document.getElementById('eff-val').innerText = `${Math.round(data.efficiency)}%`;
        }, 300);

        const statusText = document.getElementById('score-status');
        if (data.totalScore >= 80) { statusText.innerText = "EXCELLENT SUSTAINABILITY"; statusText.style.color = "var(--success)"; }
        else if (data.totalScore >= 50) { statusText.innerText = "MODERATE DEVELOPMENT"; statusText.style.color = "var(--warning)"; }
        else { statusText.innerText = "CRITICAL ACTION REQUIRED"; statusText.style.color = "var(--danger)"; }
    }

    function updatePulse() {
        const grid = document.getElementById('pulse-grid');
        grid.innerHTML = '';
        const inputs = window.cityData.inputs;

        const issues = [
            { id: 'poll', name: 'Air Pollution', val: inputs.energyCons + inputs.transCong, desc: 'Caused by high energy use and vehicle gridlock.' },
            { id: 'water', name: 'Water Stress', val: inputs.waterRain + inputs.waterLeak, desc: 'Inefficient harvesting and distribution loss detected.' },
            { id: 'traffic', name: 'Traffic Congestion', val: inputs.transCong + inputs.transWalk, desc: 'Main arteries operating at over-capacity.' },
            { id: 'waste', name: 'Waste Overflow', val: inputs.wasteSeg + inputs.wastePub, desc: 'Low segregation leads to processing delays.' }
        ];

        issues.forEach(issue => {
            const severity = issue.val < 15 ? 'critical' : (issue.val < 30 ? 'moderate' : 'good');
            const tagClass = `tag-${severity}`;
            const severityLabel = severity.toUpperCase();

            grid.innerHTML += `
                <div class="glass-card pulse-card ${severity}">
                    <span class="severity-tag ${tagClass}">${severityLabel}</span>
                    <h4>${issue.name}</h4>
                    <p class="text-muted" style="font-size: 0.85rem; margin-top: 10px;">${issue.desc}</p>
                </div>
            `;
        });
    }

    function updateRecommendations() {
        const container = document.getElementById('recom-container');
        container.innerHTML = '';
        const inputs = window.cityData.inputs;

        const recs = [];
        if (inputs.energyEff === 0) recs.push({ title: 'Energy Retrofitting', text: 'Mandate LED and IoT sensors in all commercial buildings to cut base load by 40%.' });
        if (inputs.transCong === 0) recs.push({ title: 'AI Traffic Management', text: 'Deploy neural-link traffic sensors to optimize signal timing and reduce idle time.' });
        if (inputs.wasteSeg === 0) recs.push({ title: 'Incentivized Segregation', text: 'Implement a "Reward-for-Waste" app to increase segregation rates at source.' });
        if (inputs.waterLeak === 0) recs.push({ title: 'Smart Grid Repair', text: 'Use acoustic leak detection to fix underground distribution loss.' });

        if (recs.length === 0) {
            container.innerHTML = '<div class="glass-card"><p>Your city is operating at peak efficiency. Focus on maintaining citizen engagement.</p></div>';
        } else {
            recs.forEach(r => {
                container.innerHTML += `
                    <div class="glass-card" style="display: flex; align-items: center; gap: 1.5rem;">
                        <i class="fas fa-check-circle" style="color: var(--primary); font-size: 1.5rem;"></i>
                        <div>
                            <h4 style="margin-bottom: 5px;">${r.title}</h4>
                            <p class="text-muted">${r.text}</p>
                        </div>
                    </div>
                `;
            });
        }
    }

    function updatePredictions() {
        const data = window.cityData;
        const inputs = data.inputs;

        document.getElementById('predict-water').innerText = inputs.waterRain === 0 
            ? "Predicted 60% water deficit by 2038. Reservoir depletion is imminent." 
            : "Stable water supply projected. Harvesting systems securing the aquifer.";
        
        document.getElementById('predict-poll').innerText = data.pollution > 60 
            ? "AQI expected to enter 'Hazardous' zone. Respiratory health issues projected to rise by 25%." 
            : "Air quality improving. City on track for WHO 'Clean Air' certification.";

        document.getElementById('predict-stress').innerText = inputs.transCong === 0 || inputs.lifeComm === 0 
            ? "High urban stress. Infrastructure likely to buckle under 1.2M new residents." 
            : "Resilient growth. Infrastructure scaling efficiently with population.";
    }

    function updateEcoScore() {
        const inputs = window.cityData.inputs;
        const ecoScore = inputs.lifePlastic + inputs.lifeComm + (inputs.energyCons / 2) + (inputs.transWalk / 2) + 30;
        const numDisplay = document.getElementById('eco-score-num');
        const badge = document.getElementById('eco-badge');
        const msg = document.getElementById('eco-msg');

        numDisplay.innerText = Math.round(ecoScore);

        if (ecoScore >= 80) {
            badge.innerText = "ECO HERO"; badge.style.background = "var(--success)";
            msg.innerText = "Your lifestyle is a model for urban sustainability. You are actively healing the city.";
        } else if (ecoScore >= 50) {
            badge.innerText = "AWARE CITIZEN"; badge.style.background = "var(--warning)";
            msg.innerText = "You have good habits, but there is room for more community participation.";
        } else {
            badge.innerText = "BEGINNER"; badge.style.background = "var(--danger)";
            msg.innerText = "Small changes in your daily routine can have a massive impact. Start today!";
        }
    }

    function updateSummary() {
        const data = window.cityData;
        document.getElementById('final-total-score').innerText = `${data.totalScore}/100`;
        
        const improvement = document.getElementById('final-improvement');
        if (data.inputs.energyEff === 0) improvement.innerText = "Focus on Energy Efficiency Appliances.";
        else if (data.inputs.transCong === 0) improvement.innerText = "Public Transport & Traffic AI.";
        else improvement.innerText = "Water Harvesting & Conservation.";

        document.getElementById('final-outlook').innerText = data.totalScore > 70 
            ? "Your city is a beacon of Vikas (Growth). Intelligent planning today has secured a green 2035." 
            : "Immediate policy intervention is required. Current growth patterns are not sustainable for the next decade.";
    }

    // Helper: Animate numbers
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // 3. Custom Select Component Logic
    function initCustomSelects() {
        const nativeSelects = document.querySelectorAll('select.option-select');
        
        nativeSelects.forEach(select => {
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-select-wrapper';
            select.parentNode.insertBefore(wrapper, select);
            wrapper.appendChild(select);

            const trigger = document.createElement('div');
            trigger.className = 'custom-select-trigger';
            trigger.innerHTML = `<span>${select.options[select.selectedIndex].text}</span>`;
            wrapper.appendChild(trigger);

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'custom-options';
            
            Array.from(select.options).forEach(option => {
                const optDiv = document.createElement('div');
                optDiv.className = 'custom-option';
                if (option.selected) optDiv.classList.add('selected');
                optDiv.innerText = option.text;
                optDiv.setAttribute('data-value', option.value);
                
                optDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    select.value = option.value;
                    trigger.querySelector('span').innerText = option.text;
                    
                    optionsContainer.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                    optDiv.classList.add('selected');
                    
                    wrapper.classList.remove('open');
                });
                
                optionsContainer.appendChild(optDiv);
            });
            
            wrapper.appendChild(optionsContainer);

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other open selects
                document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                    if (w !== wrapper) w.classList.remove('open');
                });
                wrapper.classList.toggle('open');
            });
        });

        // Close on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
        });
    }

    initCustomSelects();

    // 4. Cursor Glow Effect
    const cursorGlow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        if (cursorGlow) {
            cursorGlow.style.left = `${e.clientX}px`;
            cursorGlow.style.top = `${e.clientY}px`;
        }
    });
});
