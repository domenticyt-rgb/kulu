/**
 * Whop Earnings Calculator - Interactive Script
 * Responsive, transparent creator revenue calculations with Cost / Ad Spend deduction
 * & Real-time USD ($) to INR (₹) conversion.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Exchange Rate (1 USD to INR)
  const USD_TO_INR = 85.50;

  // DOM Elements - Inputs
  const videosSlider = document.getElementById('videos-slider');
  const btnDecreaseVideos = document.getElementById('btn-decrease-videos');
  const btnIncreaseVideos = document.getElementById('btn-increase-videos');
  const videosDisplay = document.getElementById('videos-display');

  const viewsSlider = document.getElementById('views-slider');
  const viewsDisplay = document.getElementById('views-display');
  const viewsExactDisplay = document.getElementById('views-exact-display');
  const viewPresetPills = document.querySelectorAll('#group-views .preset-pill');

  const cpmSlider = document.getElementById('cpm-slider');
  const cpmDisplay = document.getElementById('cpm-display');

  // DOM Elements - Cost / Paid for Views
  const costSlider = document.getElementById('cost-slider');
  const costInput = document.getElementById('cost-input');
  const costUsdDisplay = document.getElementById('cost-usd-display');
  const costPresetPills = document.querySelectorAll('#cost-preset-pills .preset-pill');

  // DOM Elements - Results
  const perVideoAmount = document.getElementById('per-video-amount');
  const perVideoInr = document.getElementById('per-video-inr');
  const perVideoFormula = document.getElementById('per-video-formula');
  const perVideoBadgeTag = document.getElementById('per-video-badge-tag');

  const monthlyAmount = document.getElementById('monthly-amount');
  const monthlyInr = document.getElementById('monthly-inr');
  const monthlyFormula = document.getElementById('monthly-formula');
  const monthlyTitleText = document.getElementById('monthly-title-text');
  const monthlyBadgeTag = document.getElementById('monthly-badge-tag');

  // Views Presets Array (Scale from 1,000 to 10,000,000)
  const VIEWS_PRESETS = [
    1000,     // 0: 1K
    2500,     // 1: 2.5K
    5000,     // 2: 5K
    10000,    // 3: 10K
    15000,    // 4: 15K
    25000,    // 5: 25K
    35000,    // 6: 35K
    50000,    // 7: 50K
    75000,    // 8: 75K
    100000,   // 9: 100K (Default)
    150000,   // 10: 150K
    200000,   // 11: 200K
    250000,   // 12: 250K
    350000,   // 13: 350K
    500000,   // 14: 500K
    750000,   // 15: 750K
    1000000,  // 16: 1M
    1500000,  // 17: 1.5M
    2000000,  // 18: 2M
    3000000,  // 19: 3M
    5000000,  // 20: 5M
    10000000  // 21: 10M
  ];

  // Cost Presets in INR (Scale from ₹0 to ₹100,000)
  const COST_PRESETS = [
    0,        // 0: ₹0
    250,      // 1: ₹250
    500,      // 2: ₹500
    750,      // 3: ₹750
    1000,     // 4: ₹1,000
    1500,     // 5: ₹1,500
    2000,     // 6: ₹2,000
    2500,     // 7: ₹2,500
    3500,     // 8: ₹3,500
    5000,     // 9: ₹5,000
    7500,     // 10: ₹7,500
    10000,    // 11: ₹10,000
    15000,    // 12: ₹15,000
    20000,    // 13: ₹20,000
    30000,    // 14: ₹30,000
    50000,    // 15: ₹50,000
    75000,    // 16: ₹75,000
    100000    // 17: ₹100,000
  ];

  // Configure views slider initial index to 100,000 (index 9)
  viewsSlider.min = '0';
  viewsSlider.max = (VIEWS_PRESETS.length - 1).toString();
  viewsSlider.value = '9'; // 100K default

  // Configure cost slider initial index
  costSlider.min = '0';
  costSlider.max = (COST_PRESETS.length - 1).toString();
  costSlider.value = '0';

  /**
   * Format numbers into compact notations: 1K, 10K, 100K, 1.5M, 10M
   */
  function formatCompactViews(num) {
    if (num >= 1000000) {
      const millions = num / 1000000;
      return (millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)) + 'M';
    }
    if (num >= 1000) {
      const thousands = num / 1000;
      return (thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)) + 'K';
    }
    return num.toLocaleString('en-US');
  }

  /**
   * Format standard USD currency with 2 decimals and commas
   */
  function formatUSD(amount) {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Format Indian Rupee currency with Indian numerical comma separation (Lakhs / Crores)
   */
  function formatINR(amount) {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Update the visual progress track for any range slider
   */
  function updateSliderFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-pct', `${percentage}%`);
  }

  /**
   * Calculate and render earnings
   */
  function calculateEarnings() {
    const videos = parseInt(videosSlider.value, 10) || 1;
    const viewsIndex = parseInt(viewsSlider.value, 10);
    const views = VIEWS_PRESETS[viewsIndex] !== undefined ? VIEWS_PRESETS[viewsIndex] : 100000;
    const cpm = parseFloat(cpmSlider.value) || 0;
    const costInr = Math.max(0, parseFloat(costInput.value) || 0);

    // Convert Cost in INR to USD
    const costUsd = costInr / USD_TO_INR;
    costUsdDisplay.textContent = `≈ $${formatUSD(costUsd)} USD`;

    // 1. Gross Earnings Calculations (USD)
    // Per Video Gross = (views / 1,000) * CPM
    const grossPerVideoUSD = (views / 1000) * cpm;
    // Monthly Gross = Per Video Gross * Number of Videos
    const grossMonthlyUSD = grossPerVideoUSD * videos;

    // 2. Net Earnings Calculations (USD) - Deducting Cost Paid for Views
    // Cost per video = Total Cost / Videos
    const costPerVideoUSD = costUsd / videos;
    const netMonthlyUSD = Math.max(0, grossMonthlyUSD - costUsd);
    const netPerVideoUSD = Math.max(0, grossPerVideoUSD - costPerVideoUSD);

    // 3. Converted INR Earnings
    const netMonthlyINR = netMonthlyUSD * USD_TO_INR;
    const netPerVideoINR = netPerVideoUSD * USD_TO_INR;

    // 4. Update Inputs Displays
    videosDisplay.textContent = videos;
    updateSliderFill(videosSlider);

    const formattedCompact = formatCompactViews(views);
    viewsDisplay.textContent = formattedCompact;
    viewsExactDisplay.textContent = `(${views.toLocaleString('en-US')} views)`;
    updateSliderFill(viewsSlider);

    // Highlight active view preset pill
    viewPresetPills.forEach(pill => {
      const pillVal = parseInt(pill.getAttribute('data-views'), 10);
      if (pillVal === views) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    cpmDisplay.textContent = `$${cpm.toFixed(2)}`;
    updateSliderFill(cpmSlider);

    // Highlight active cost preset pill
    costPresetPills.forEach(pill => {
      const pillVal = parseFloat(pill.getAttribute('data-cost'));
      if (Math.abs(pillVal - costInr) < 1) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // 5. Update Result Cards
    perVideoAmount.textContent = formatUSD(netPerVideoUSD);
    perVideoInr.textContent = formatINR(netPerVideoINR);

    monthlyAmount.textContent = formatUSD(netMonthlyUSD);
    monthlyInr.textContent = formatINR(netMonthlyINR);

    // Dynamic labels depending on whether cost is entered
    if (costInr > 0) {
      perVideoBadgeTag.textContent = 'Net / Video';
      perVideoBadgeTag.classList.add('net-tag');
      perVideoFormula.textContent = `Gross: $${formatUSD(grossPerVideoUSD)} − Cost: $${formatUSD(costPerVideoUSD)}`;

      monthlyBadgeTag.textContent = 'Net Profit';
      monthlyBadgeTag.classList.add('net-tag');
      monthlyTitleText.textContent = 'Net Monthly Earnings';
      monthlyFormula.textContent = `Gross: $${formatUSD(grossMonthlyUSD)} − Paid: ₹${formatINR(costInr)} ($${formatUSD(costUsd)})`;
    } else {
      perVideoBadgeTag.textContent = 'Per Video';
      perVideoBadgeTag.classList.remove('net-tag');
      perVideoFormula.textContent = `(${formattedCompact} ÷ 1,000) × $${cpm.toFixed(2)}`;

      monthlyBadgeTag.textContent = 'Total Projected';
      monthlyBadgeTag.classList.remove('net-tag');
      monthlyTitleText.textContent = 'Monthly Earnings';
      monthlyFormula.textContent = `$${formatUSD(grossPerVideoUSD)} × ${videos} ${videos === 1 ? 'video' : 'videos'}`;
    }
  }

  // --- Event Listeners ---

  // Videos Slider
  videosSlider.addEventListener('input', calculateEarnings);

  // Stepper buttons for videos
  btnDecreaseVideos.addEventListener('click', () => {
    let current = parseInt(videosSlider.value, 10);
    if (current > parseInt(videosSlider.min, 10)) {
      videosSlider.value = current - 1;
      calculateEarnings();
    }
  });

  btnIncreaseVideos.addEventListener('click', () => {
    let current = parseInt(videosSlider.value, 10);
    if (current < parseInt(videosSlider.max, 10)) {
      videosSlider.value = current + 1;
      calculateEarnings();
    }
  });

  // Views Slider
  viewsSlider.addEventListener('input', calculateEarnings);

  // View Preset Pills
  viewPresetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetViews = parseInt(pill.getAttribute('data-views'), 10);
      const targetIndex = VIEWS_PRESETS.indexOf(targetViews);
      if (targetIndex !== -1) {
        viewsSlider.value = targetIndex;
        calculateEarnings();
      }
    });
  });

  // CPM Slider
  cpmSlider.addEventListener('input', calculateEarnings);

  // Cost Slider
  costSlider.addEventListener('input', () => {
    const idx = parseInt(costSlider.value, 10);
    const selectedCost = COST_PRESETS[idx] !== undefined ? COST_PRESETS[idx] : 0;
    costInput.value = selectedCost;
    updateSliderFill(costSlider);
    calculateEarnings();
  });

  // Cost Input Direct Typing
  costInput.addEventListener('input', () => {
    const entered = parseFloat(costInput.value) || 0;
    // Find closest index in COST_PRESETS to sync slider
    let closestIdx = 0;
    let minDiff = Infinity;
    COST_PRESETS.forEach((val, i) => {
      const diff = Math.abs(val - entered);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });
    costSlider.value = closestIdx;
    updateSliderFill(costSlider);
    calculateEarnings();
  });

  // Cost Preset Pills
  costPresetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetCost = parseFloat(pill.getAttribute('data-cost'));
      costInput.value = targetCost;
      const targetIndex = COST_PRESETS.indexOf(targetCost);
      if (targetIndex !== -1) {
        costSlider.value = targetIndex;
      }
      updateSliderFill(costSlider);
      calculateEarnings();
    });
  });

  // Initial Calculation & Track Fills
  updateSliderFill(videosSlider);
  updateSliderFill(viewsSlider);
  updateSliderFill(cpmSlider);
  updateSliderFill(costSlider);
  calculateEarnings();
});
