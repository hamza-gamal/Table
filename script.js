/**
 * ═══════════════════════════════════════════════════════════════
 * TABLE HUB PRO - CORE APPLICATION SCRIPT
 * Author: Hamza Gamal (https://hamza-gamal.github.io/portfolio)
 * Features:
 *   - Bilingual (English default, one-click toggle to Arabic RTL)
 *   - Dark mode default with luxury Red & Black palette
 *   - Dynamic table scaling (+1 / -1, default 1 table)
 *   - Full table customization (width slider, row height, rows/cols)
 *   - Excel-compatible CSV export (UTF-8 BOM for Arabic)
 *   - Print / PDF support, instant search, and auto-save
 * ═══════════════════════════════════════════════════════════════
 */

// ── i18n Translation Dictionary ──
const I18N = {
  en: {
    appTitle: "Table Hub",
    appBadge: "PRO",
    appSubtitle: "Multi-Table Management & Interactive Studio",
    searchPlaceholder: "Search across all tables...",
    viewAll: "All Tables",
    viewFocused: "Single View",
    exportAll: "Export All",
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    langSwitch: "العربية",
    addTableShort: "+ Table",
    tableActiveSingle: "1 Table Active",
    tableActivePlural: "{n} Tables Active",
    scalingTitle: "Manage Table Copies",
    scalingDesc: "Add or remove tables dynamically (+1 / -1). Scale up to 15, 20 or more copies with instant auto-save and full isolation.",
    addOneTable: "+1 Table",
    removeOneTable: "-1 Table",
    resetTables: "Reset (1 Table)",
    totalCopies: "Total Copies:",
    tableDefaultTitle: "Table {n}: Data Set",
    colDefault: "Column {n}",
    widthLabel: "Width:",
    spacingLabel: "Spacing:",
    compact: "Compact",
    normal: "Normal",
    spacious: "Spacious",
    addRow: "+ Row",
    addCol: "+ Column",
    duplicate: "Duplicate",
    clear: "Clear Data",
    exportCsv: "Export CSV",
    print: "Print",
    rowsCount: "{n} Rows",
    colsCount: "{n} Columns",
    cellsCount: "{n} Cells",
    autoSaveToast: "Auto-saved",
    tableAddedToast: "Table {n} created successfully",
    tableRemovedToast: "Table {n} removed",
    csvExportedToast: "Exported {name} to CSV",
    allExportedToast: "All tables exported to JSON",
    confirmClearTitle: "Clear Table Data",
    confirmClearMsg: "Are you sure you want to clear all cell values in '{name}'?",
    confirmResetTitle: "Reset All Tables",
    confirmResetMsg: "Reset back to 1 table only? Additional copies will be removed.",
    confirmDeleteColTitle: "Delete Column",
    confirmDeleteColMsg: "Delete this column and its contents?",
    confirmBtn: "Confirm",
    cancelBtn: "Cancel",
    noResults: "No matching cells found"
  },
  ar: {
    appTitle: "جدول",
    appBadge: "برو",
    appSubtitle: "نظام الجداول المتعددة والتحكم الشامل",
    searchPlaceholder: "بحث في محتوى الجداول...",
    viewAll: "عرض الكل",
    viewFocused: "عرض مركز",
    exportAll: "تصدير النسخ",
    themeDark: "الدارك مود",
    themeLight: "اللايت مود",
    langSwitch: "English",
    addTableShort: "+ جدول",
    tableActiveSingle: "1 جدول نشط",
    tableActivePlural: "{n} جداول نشطة",
    scalingTitle: "إدارة عدد نسخ الجدول",
    scalingDesc: "يمكنك زيادة عدد النسخ بمقدار 1 نسخة إضافية حتى 15، 20 أو أكثر، مع إمكانية التراجع والتنقل بسهولة.",
    addOneTable: "+1 جدول",
    removeOneTable: "-1 جدول",
    resetTables: "إعادة ضبط (جدول 1)",
    totalCopies: "إجمالي النسخ:",
    tableDefaultTitle: "نسخة {n}: جدول البيانات",
    colDefault: "عمود {n}",
    widthLabel: "العرض:",
    spacingLabel: "المسافات:",
    compact: "مضغوط",
    normal: "متوسط",
    spacious: "مريح",
    addRow: "+ صف",
    addCol: "+ عمود",
    duplicate: "نسخ",
    clear: "تفريغ",
    exportCsv: "تصدير CSV",
    print: "طباعة",
    rowsCount: "{n} صفوف",
    colsCount: "{n} أعمدة",
    cellsCount: "{n} خلايا",
    autoSaveToast: "تم الحفظ تلقائياً",
    tableAddedToast: "تم إنشاء الجدول {n} بنجاح",
    tableRemovedToast: "تم حذف الجدول {n}",
    csvExportedToast: "تم تصدير {name} إلى ملف CSV",
    allExportedToast: "تم تصدير كافة الجداول كملف JSON",
    confirmClearTitle: "تفريغ بيانات الجدول",
    confirmClearMsg: "هل أنت متأكد من تفريغ كافة خلايا '{name}'؟",
    confirmResetTitle: "إعادة الضبط لجدول واحد",
    confirmResetMsg: "هل تريد حذف النسخ الإضافية والعودة لجدول واحد فقط؟",
    confirmDeleteColTitle: "حذف العمود",
    confirmDeleteColMsg: "هل تريد حذف هذا العمود ومحتوياته؟",
    confirmBtn: "تأكيد",
    cancelBtn: "إلغاء",
    noResults: "لم يتم العثور على نتائج مطابقة"
  }
};

// ── Application State ──
const AppState = {
  // Defaults per user requirements: English default & Dark Mode default
  lang: localStorage.getItem("table_hub_lang") || "en",
  theme: localStorage.getItem("table_hub_theme") || "dark",
  viewMode: "tabs", // 'tabs' or 'grid'
  activeTableId: 1,
  tables: [],
  searchQuery: ""
};

// Default Sample Template for Table 1
function createDefaultTableData(id, num) {
  const isArabic = AppState.lang === "ar";
  return {
    id: id,
    title: isArabic ? `نسخة ${num}: جدول البيانات` : `Table ${num}: Project Data`,
    widthPercent: 100,
    spacing: "normal", // 'compact', 'normal', 'spacious'
    columns: isArabic
      ? ["الاسم", "المهمة", "الحالة", "التقييم"]
      : ["Item / Task", "Category", "Status", "Priority"],
    rows: isArabic
      ? [
          ["تصميم واجهة المستخدم", "تطوير", "مكتمل", "عالي"],
          ["ربط نظام اللغات", "برمجة", "قيد العمل", "عالي"],
          ["إعداد الوضع المظلم", "تصميم", "مكتمل", "متوسط"],
          ["تصدير ملفات Excel", "برمجة", "مكتمل", "عالي"],
          ["مراجعة الأداء النهائي", "اختبار", "قادم", "عادي"]
        ]
      : [
          ["Modern Red Theme", "UI Design", "Completed", "High"],
          ["Bilingual System (EN/AR)", "Frontend", "Active", "Urgent"],
          ["Table Dynamic Scaling", "Core Logic", "Ready", "High"],
          ["CSV & Excel Export", "Feature", "Ready", "Medium"],
          ["Hamza Gamal Portfolio Link", "Branding", "Integrated", "Normal"]
        ]
  };
}

// ── Initialization ──
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  loadStoredData();
  applyLanguage(AppState.lang, false);
  applyTheme(AppState.theme, false);
  bindGlobalEvents();
  renderApp();
});

// Update Copyright Year
function initYear() {
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Load Persisted Data from localStorage
function loadStoredData() {
  const saved = localStorage.getItem("table_hub_data");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        AppState.tables = parsed;
        AppState.activeTableId = AppState.tables[0].id;
        return;
      }
    } catch (e) {
      console.warn("Could not parse saved table data, resetting to defaults", e);
    }
  }

  // First time visitor: Default exactly 1 Table
  AppState.tables = [createDefaultTableData(1, 1)];
  AppState.activeTableId = 1;
}

// Save Data to localStorage
function saveData() {
  localStorage.setItem("table_hub_data", JSON.stringify(AppState.tables));
  showToast(I18N[AppState.lang].autoSaveToast, "save");
}

// ── Language Management (EN / AR) ──
function applyLanguage(lang, shouldReRender = true) {
  AppState.lang = lang;
  localStorage.setItem("table_hub_lang", lang);

  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";

  // Translate all static elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (I18N[lang][key]) {
      el.placeholder = I18N[lang][key];
    }
  });

  // Update Language Button Label (shows target language)
  const langBtnText = document.getElementById("langBtnText");
  if (langBtnText) {
    langBtnText.textContent = I18N[lang].langSwitch;
  }

  // Update Theme Label
  updateThemeLabel();

  if (shouldReRender) {
    renderApp();
  }
}

function toggleLanguage() {
  const newLang = AppState.lang === "en" ? "ar" : "en";
  applyLanguage(newLang, true);
}

// ── Theme Management (Dark / Light) ──
function applyTheme(theme, shouldSave = true) {
  AppState.theme = theme;
  if (shouldSave) {
    localStorage.setItem("table_hub_theme", theme);
  }
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeLabel();
}

function toggleTheme() {
  const newTheme = AppState.theme === "dark" ? "light" : "dark";
  applyTheme(newTheme, true);
}

function updateThemeLabel() {
  const labelEl = document.querySelector(".theme-label");
  if (labelEl) {
    labelEl.textContent =
      AppState.theme === "dark"
        ? I18N[AppState.lang].themeDark
        : I18N[AppState.lang].themeLight;
  }
}

// ── Global Event Bindings ──
function bindGlobalEvents() {
  // Theme Toggle
  document.getElementById("themeToggleBtn")?.addEventListener("click", toggleTheme);

  // Language Toggle
  document.getElementById("langToggleBtn")?.addEventListener("click", toggleLanguage);

  // View Mode Toggle (Tabs vs Grid)
  document.getElementById("viewToggleBtn")?.addEventListener("click", toggleViewMode);

  // Export All Tables
  document.getElementById("exportAllBtn")?.addEventListener("click", exportAllTablesJSON);

  // Global Search
  const searchInput = document.getElementById("globalSearchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  searchInput?.addEventListener("input", (e) => {
    AppState.searchQuery = e.target.value.trim().toLowerCase();
    if (clearSearchBtn) {
      clearSearchBtn.style.display = AppState.searchQuery ? "block" : "none";
    }
    filterTableContent();
  });

  clearSearchBtn?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    AppState.searchQuery = "";
    clearSearchBtn.style.display = "none";
    filterTableContent();
  });

  // Scaling Controls (+1 / -1 / Reset)
  document.getElementById("addTableBtn")?.addEventListener("click", () => addTable());
  document.getElementById("quickAddTabBtn")?.addEventListener("click", () => addTable());
  document.getElementById("removeTableBtn")?.addEventListener("click", () => removeLastTable());
  document.getElementById("resetTablesBtn")?.addEventListener("click", () => resetTables());
}

// ── View Mode Switching (Tabs / Grid) ──
function toggleViewMode() {
  AppState.viewMode = AppState.viewMode === "tabs" ? "grid" : "tabs";
  const btn = document.getElementById("viewToggleBtn");
  if (btn) {
    const textSpan = btn.querySelector(".btn-text");
    const icon = btn.querySelector("i");
    if (AppState.viewMode === "grid") {
      if (textSpan) textSpan.textContent = I18N[AppState.lang].viewFocused;
      if (icon) icon.className = "fa-solid fa-window-maximize";
    } else {
      if (textSpan) textSpan.textContent = I18N[AppState.lang].viewAll;
      if (icon) icon.className = "fa-solid fa-table-cells-large";
    }
  }
  renderApp();
}

// ── Table Management (+1 / -1 / Reset / Duplicate) ──
function addTable(customData = null) {
  const nextId =
    AppState.tables.length > 0
      ? Math.max(...AppState.tables.map((t) => t.id)) + 1
      : 1;
  const nextIndex = AppState.tables.length + 1;

  const newTable = customData
    ? {
        ...customData,
        id: nextId,
        title: customData.title + (AppState.lang === "ar" ? " (نسخة مكررة)" : " (Copy)")
      }
    : createDefaultTableData(nextId, nextIndex);

  AppState.tables.push(newTable);
  AppState.activeTableId = nextId;

  saveData();
  renderApp();

  showToast(
    I18N[AppState.lang].tableAddedToast.replace("{n}", nextIndex),
    "add"
  );
}

function removeLastTable() {
  if (AppState.tables.length <= 1) return;

  const removedIndex = AppState.tables.length;
  const removed = AppState.tables.pop();

  if (AppState.activeTableId === removed.id) {
    AppState.activeTableId = AppState.tables[AppState.tables.length - 1].id;
  }

  saveData();
  renderApp();

  showToast(
    I18N[AppState.lang].tableRemovedToast.replace("{n}", removedIndex),
    "remove"
  );
}

function removeTableById(id) {
  if (AppState.tables.length <= 1) return;

  const idx = AppState.tables.findIndex((t) => t.id === id);
  if (idx === -1) return;

  AppState.tables.splice(idx, 1);
  if (AppState.activeTableId === id) {
    AppState.activeTableId = AppState.tables[Math.max(0, idx - 1)].id;
  }

  saveData();
  renderApp();
}

function resetTables() {
  showModal(
    I18N[AppState.lang].confirmResetTitle,
    I18N[AppState.lang].confirmResetMsg,
    () => {
      AppState.tables = [createDefaultTableData(1, 1)];
      AppState.activeTableId = 1;
      saveData();
      renderApp();
    }
  );
}

function duplicateTable(tableId) {
  const source = AppState.tables.find((t) => t.id === tableId);
  if (!source) return;

  const cloned = JSON.parse(JSON.stringify(source));
  addTable(cloned);
}

function clearTableData(tableId) {
  const table = AppState.tables.find((t) => t.id === tableId);
  if (!table) return;

  showModal(
    I18N[AppState.lang].confirmClearTitle,
    I18N[AppState.lang].confirmClearMsg.replace("{name}", table.title),
    () => {
      table.rows = table.rows.map((row) => row.map(() => ""));
      saveData();
      renderApp();
    }
  );
}

// ── Rendering Engine ──
function renderApp() {
  renderTabs();
  renderWorkspace();
  updateSummaryIndicators();
}

// Render Tabs Bar
function renderTabs() {
  const container = document.getElementById("tabsContainer");
  if (!container) return;

  container.innerHTML = "";

  AppState.tables.forEach((table, index) => {
    const tabEl = document.createElement("div");
    tabEl.className = `tab-item ${table.id === AppState.activeTableId ? "active" : ""}`;
    tabEl.innerHTML = `
      <i class="fa-solid fa-table"></i>
      <span class="tab-label">${escapeHtml(table.title || `Table ${index + 1}`)}</span>
      ${
        AppState.tables.length > 1
          ? `<button class="tab-close-btn" title="Remove Table" data-id="${table.id}">
              <i class="fa-solid fa-xmark"></i>
            </button>`
          : ""
      }
    `;

    tabEl.addEventListener("click", (e) => {
      if (e.target.closest(".tab-close-btn")) return;
      AppState.activeTableId = table.id;
      if (AppState.viewMode === "grid") {
        AppState.viewMode = "tabs";
        const btn = document.getElementById("viewToggleBtn");
        if (btn) {
          const textSpan = btn.querySelector(".btn-text");
          if (textSpan) textSpan.textContent = I18N[AppState.lang].viewAll;
        }
      }
      renderApp();
    });

    const closeBtn = tabEl.querySelector(".tab-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeTableById(table.id);
      });
    }

    container.appendChild(tabEl);
  });
}

// Render Workspace (Single Focused View vs Grid View)
function renderWorkspace() {
  const workspace = document.getElementById("tableWorkspace");
  if (!workspace) return;

  workspace.innerHTML = "";
  workspace.className =
    AppState.viewMode === "grid"
      ? "table-workspace workspace-grid-mode"
      : "table-workspace";

  const tablesToRender =
    AppState.viewMode === "grid"
      ? AppState.tables
      : AppState.tables.filter((t) => t.id === AppState.activeTableId);

  // If no table matched (edge case), render first table
  if (tablesToRender.length === 0 && AppState.tables.length > 0) {
    AppState.activeTableId = AppState.tables[0].id;
    tablesToRender.push(AppState.tables[0]);
  }

  tablesToRender.forEach((table, index) => {
    const cardEl = createTableCardElement(table, index + 1);
    workspace.appendChild(cardEl);
  });

  if (AppState.searchQuery) {
    filterTableContent();
  }
}

// Create HTML for a Table Card
function createTableCardElement(table, displayIndex) {
  const card = document.createElement("div");
  card.className = "table-card";
  card.id = `table-card-${table.id}`;

  const lang = AppState.lang;
  const i18n = I18N[lang];

  card.innerHTML = `
    <!-- Table Header -->
    <div class="table-card-header">
      <div class="table-title-area">
        <span class="table-badge-index">#${displayIndex}</span>
        <input 
          type="text" 
          class="table-title-input" 
          value="${escapeHtml(table.title)}" 
          placeholder="${i18n.tableDefaultTitle.replace("{n}", displayIndex)}" 
          data-table-id="${table.id}"
        />
      </div>

      <div class="table-quick-actions">
        <!-- Duplicate Button -->
        <button class="card-action-btn" data-action="duplicate" data-table-id="${table.id}" title="${i18n.duplicate}">
          <i class="fa-solid fa-copy"></i>
          <span>${i18n.duplicate}</span>
        </button>

        <!-- Clear Button -->
        <button class="card-action-btn btn-danger" data-action="clear" data-table-id="${table.id}" title="${i18n.clear}">
          <i class="fa-solid fa-trash-can"></i>
          <span>${i18n.clear}</span>
        </button>

        <!-- Export CSV Button -->
        <button class="card-action-btn" data-action="export-csv" data-table-id="${table.id}" title="${i18n.exportCsv}">
          <i class="fa-solid fa-file-csv"></i>
          <span>${i18n.exportCsv}</span>
        </button>

        <!-- Print Button -->
        <button class="card-action-btn" data-action="print" data-table-id="${table.id}" title="${i18n.print}">
          <i class="fa-solid fa-print"></i>
          <span>${i18n.print}</span>
        </button>
      </div>
    </div>

    <!-- Table Toolbar (Width slider, Spacing, +Row, +Col) -->
    <div class="table-toolbar">
      <div class="toolbar-group">
        <!-- Table Width Slider -->
        <div class="slider-control">
          <span><i class="fa-solid fa-arrows-left-right"></i> ${i18n.widthLabel}</span>
          <input 
            type="range" 
            min="50" 
            max="100" 
            value="${table.widthPercent || 100}" 
            data-table-id="${table.id}" 
            class="table-width-slider" 
          />
          <span class="width-val-display">${table.widthPercent || 100}%</span>
        </div>

        <!-- Row Spacing Picker -->
        <div class="row-spacing-picker">
          <button class="spacing-btn ${table.spacing === "compact" ? "active" : ""}" data-spacing="compact" data-table-id="${table.id}">
            ${i18n.compact}
          </button>
          <button class="spacing-btn ${table.spacing === "normal" || !table.spacing ? "active" : ""}" data-spacing="normal" data-table-id="${table.id}">
            ${i18n.normal}
          </button>
          <button class="spacing-btn ${table.spacing === "spacious" ? "active" : ""}" data-spacing="spacious" data-table-id="${table.id}">
            ${i18n.spacious}
          </button>
        </div>
      </div>

      <div class="toolbar-group">
        <!-- Add Row Button -->
        <button class="toolbar-btn" data-action="add-row" data-table-id="${table.id}">
          <i class="fa-solid fa-plus"></i>
          <span>${i18n.addRow}</span>
        </button>

        <!-- Add Column Button -->
        <button class="toolbar-btn" data-action="add-col" data-table-id="${table.id}">
          <i class="fa-solid fa-table-columns"></i>
          <span>${i18n.addCol}</span>
        </button>
      </div>
    </div>

    <!-- Table Responsive Wrapper -->
    <div class="table-responsive-wrapper" style="width: ${table.widthPercent || 100}%;">
      <table class="data-table spacing-${table.spacing || "normal"}" data-table-id="${table.id}">
        <thead>
          <tr>
            <th class="row-idx-cell">#</th>
            ${table.columns
              .map(
                (colName, colIdx) => `
              <th data-col-idx="${colIdx}">
                <div class="th-content">
                  <span class="th-editable-title" contenteditable="true" spellcheck="false">${escapeHtml(colName)}</span>
                  ${
                    table.columns.length > 1
                      ? `<button class="th-delete-col-btn" title="Delete Column" data-col-idx="${colIdx}">
                          <i class="fa-solid fa-xmark"></i>
                        </button>`
                      : ""
                  }
                </div>
              </th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${table.rows
            .map(
              (row, rowIdx) => `
            <tr data-row-idx="${rowIdx}">
              <td class="row-idx-cell">
                <span class="row-num">${rowIdx + 1}</span>
                ${
                  table.rows.length > 1
                    ? `<button class="row-delete-btn" title="Delete Row" data-row-idx="${rowIdx}">
                        <i class="fa-solid fa-minus"></i>
                      </button>`
                    : ""
                }
              </td>
              ${row
                .map(
                  (cellVal, colIdx) => `
                <td contenteditable="true" spellcheck="false" data-row="${rowIdx}" data-col="${colIdx}">${escapeHtml(cellVal)}</td>`
                )
                .join("")}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Table Status Bar -->
    <div class="table-status-bar">
      <div class="status-stats">
        <span class="stat-pill"><i class="fa-solid fa-bars"></i> ${i18n.rowsCount.replace("{n}", table.rows.length)}</span>
        <span class="stat-pill"><i class="fa-solid fa-table-columns"></i> ${i18n.colsCount.replace("{n}", table.columns.length)}</span>
        <span class="stat-pill"><i class="fa-solid fa-border-all"></i> ${i18n.cellsCount.replace("{n}", table.rows.length * table.columns.length)}</span>
      </div>
      <div class="status-saved">
        <i class="fa-solid fa-circle-check" style="color: var(--accent-red);"></i> ${i18n.autoSaveToast}
      </div>
    </div>
  `;

  bindCardEvents(card, table);
  return card;
}

// Bind Events inside a single Table Card
function bindCardEvents(card, table) {
  // Title Input
  const titleInput = card.querySelector(".table-title-input");
  titleInput?.addEventListener("input", (e) => {
    table.title = e.target.value;
    updateTabTitle(table.id, table.title);
    saveData();
  });

  // Action Buttons
  card.querySelectorAll(".card-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action === "duplicate") duplicateTable(table.id);
      if (action === "clear") clearTableData(table.id);
      if (action === "export-csv") exportTableCSV(table.id);
      if (action === "print") printSingleTable(table.id);
    });
  });

  // Width Slider
  const widthSlider = card.querySelector(".table-width-slider");
  const widthDisplay = card.querySelector(".width-val-display");
  const wrapper = card.querySelector(".table-responsive-wrapper");

  widthSlider?.addEventListener("input", (e) => {
    const val = e.target.value;
    table.widthPercent = Number(val);
    if (widthDisplay) widthDisplay.textContent = `${val}%`;
    if (wrapper) wrapper.style.width = `${val}%`;
    saveData();
  });

  // Row Spacing Buttons
  card.querySelectorAll(".spacing-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const spacing = btn.getAttribute("data-spacing");
      table.spacing = spacing;
      const dataTable = card.querySelector(".data-table");
      if (dataTable) {
        dataTable.className = `data-table spacing-${spacing}`;
      }
      card.querySelectorAll(".spacing-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      saveData();
    });
  });

  // Add Row
  card.querySelector('[data-action="add-row"]')?.addEventListener("click", () => {
    const emptyRow = new Array(table.columns.length).fill("");
    table.rows.push(emptyRow);
    saveData();
    renderApp();
  });

  // Add Column
  card.querySelector('[data-action="add-col"]')?.addEventListener("click", () => {
    const nextColNum = table.columns.length + 1;
    const colName = I18N[AppState.lang].colDefault.replace("{n}", nextColNum);
    table.columns.push(colName);
    table.rows.forEach((row) => row.push(""));
    saveData();
    renderApp();
  });

  // Header Title Edit
  card.querySelectorAll(".th-editable-title").forEach((thTitle) => {
    thTitle.addEventListener("blur", () => {
      const colIdx = Number(thTitle.closest("th").getAttribute("data-col-idx"));
      table.columns[colIdx] = thTitle.textContent.trim() || `Col ${colIdx + 1}`;
      saveData();
    });
  });

  // Delete Column
  card.querySelectorAll(".th-delete-col-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const colIdx = Number(btn.getAttribute("data-col-idx"));
      if (table.columns.length <= 1) return;

      table.columns.splice(colIdx, 1);
      table.rows.forEach((row) => row.splice(colIdx, 1));
      saveData();
      renderApp();
    });
  });

  // Delete Row
  card.querySelectorAll(".row-delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const rowIdx = Number(btn.getAttribute("data-row-idx"));
      if (table.rows.length <= 1) return;

      table.rows.splice(rowIdx, 1);
      saveData();
      renderApp();
    });
  });

  // Editable Cells
  card.querySelectorAll("tbody td[contenteditable='true']").forEach((td) => {
    td.addEventListener("input", () => {
      const r = Number(td.getAttribute("data-row"));
      const c = Number(td.getAttribute("data-col"));
      if (table.rows[r]) {
        table.rows[r][c] = td.textContent;
        saveData();
      }
    });

    // Arrow Key & Tab Cell Navigation
    td.addEventListener("keydown", (e) => {
      const r = Number(td.getAttribute("data-row"));
      const c = Number(td.getAttribute("data-col"));

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const nextCell = card.querySelector(`td[data-row="${r + 1}"][data-col="${c}"]`);
        if (nextCell) nextCell.focus();
      }
    });
  });
}

// Update Tab Title when user types in table card title
function updateTabTitle(tableId, title) {
  const tabs = document.querySelectorAll(".tab-item");
  AppState.tables.forEach((t, i) => {
    if (t.id === tableId && tabs[i]) {
      const label = tabs[i].querySelector(".tab-label");
      if (label) label.textContent = title || `Table ${i + 1}`;
    }
  });
}

// Update Active Count & Disable -1 Button when count == 1
function updateSummaryIndicators() {
  const count = AppState.tables.length;
  const lang = AppState.lang;

  // Tabs Summary Badge
  const summaryBadge = document.getElementById("activeCountText");
  if (summaryBadge) {
    summaryBadge.textContent =
      count === 1
        ? I18N[lang].tableActiveSingle
        : I18N[lang].tableActivePlural.replace("{n}", count);
  }

  // Scaling Deck Pill Number
  const scaleCountNumber = document.getElementById("scaleCountNumber");
  if (scaleCountNumber) {
    scaleCountNumber.textContent = count;
  }

  // Disable Remove Button if only 1 table left
  const removeBtn = document.getElementById("removeTableBtn");
  if (removeBtn) {
    removeBtn.disabled = count <= 1;
  }
}

// ── Search & Filter Engine ──
function filterTableContent() {
  const query = AppState.searchQuery;
  const cards = document.querySelectorAll(".table-card");

  cards.forEach((card) => {
    const rows = card.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      if (!query) {
        row.style.display = "";
        row.querySelectorAll("td").forEach((td) => {
          td.style.backgroundColor = "";
        });
        return;
      }

      let matches = false;
      row.querySelectorAll("td[contenteditable='true']").forEach((td) => {
        const text = td.textContent.toLowerCase();
        if (text.includes(query)) {
          matches = true;
          td.style.backgroundColor = "var(--table-selected)";
        } else {
          td.style.backgroundColor = "";
        }
      });

      row.style.display = matches ? "" : "none";
    });
  });
}

// ── Export Features (CSV with UTF-8 BOM & JSON) ──
function exportTableCSV(tableId) {
  const table = AppState.tables.find((t) => t.id === tableId);
  if (!table) return;

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headerRow = table.columns.map(escapeCsv).join(",");
  const bodyRows = table.rows.map((row) => row.map(escapeCsv).join(","));
  const csvContent = [headerRow, ...bodyRows].join("\r\n");

  // \uFEFF (UTF-8 BOM) is essential so Microsoft Excel opens Arabic text correctly!
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const cleanTitle = (table.title || "Table").replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");

  a.href = url;
  a.download = `${cleanTitle}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(
    I18N[AppState.lang].csvExportedToast.replace("{name}", table.title),
    "export"
  );
}

function exportAllTablesJSON() {
  const dataStr = JSON.stringify(AppState.tables, null, 2);
  const blob = new Blob([dataStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TableHub_AllTables_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(I18N[AppState.lang].allExportedToast, "export");
}

function printSingleTable(tableId) {
  window.print();
}

// ── Modal Dialog ──
function showModal(title, message, onConfirm) {
  const overlay = document.getElementById("modalOverlay");
  const titleEl = document.getElementById("modalTitle");
  const msgEl = document.getElementById("modalMessage");
  const confirmBtn = document.getElementById("modalConfirmBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");

  if (!overlay || !titleEl || !msgEl || !confirmBtn || !cancelBtn) return;

  titleEl.textContent = title;
  msgEl.textContent = message;
  confirmBtn.textContent = I18N[AppState.lang].confirmBtn;
  cancelBtn.textContent = I18N[AppState.lang].cancelBtn;

  overlay.style.display = "flex";

  const cleanup = () => {
    overlay.style.display = "none";
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  confirmBtn.onclick = () => {
    cleanup();
    if (onConfirm) onConfirm();
  };

  cancelBtn.onclick = () => {
    cleanup();
  };
}

// ── Toast Notification ──
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;

  let icon = "fa-solid fa-circle-check";
  if (type === "add") icon = "fa-solid fa-plus";
  if (type === "remove") icon = "fa-solid fa-trash-can";
  if (type === "export") icon = "fa-solid fa-file-arrow-down";

  toast.innerHTML = `<i class="${icon}" style="color: var(--accent-red);"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 2200);
}

// Helper to sanitize HTML strings
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
