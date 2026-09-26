// ============================================
// DYNAMIC LEARNING APP - KCNA Exam Prep
// ============================================

let currentChapter = null;
let currentLab = null;
let chapters = [];
let currentChapterFile = null;
let chapterQuizActive = false;
let chapterQuizAnswers = {};

// ============================================
// PROGRESS TRACKING
// ============================================

const PROGRESS_KEY = 'kcna_progress';

function getProgress() {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {
        completedLessons: {},  // { 'chapter1.json': [0, 1, 2] }
        quizScores: {},        // { 'chapter1.json': { score: 8, total: 10, date: '...' } }
        lastVisited: null
    };
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function markLessonComplete(chapterFile, lessonIndex) {
    const progress = getProgress();
    if (!progress.completedLessons[chapterFile]) {
        progress.completedLessons[chapterFile] = [];
    }
    if (!progress.completedLessons[chapterFile].includes(lessonIndex)) {
        progress.completedLessons[chapterFile].push(lessonIndex);
    }
    progress.lastVisited = { chapter: chapterFile, lesson: lessonIndex };
    saveProgress(progress);
    updateProgressUI();
}

function isLessonComplete(chapterFile, lessonIndex) {
    const progress = getProgress();
    return progress.completedLessons[chapterFile]?.includes(lessonIndex) || false;
}

function getChapterProgress(chapterFile, totalLessons) {
    const progress = getProgress();
    const completed = progress.completedLessons[chapterFile]?.length || 0;
    return Math.round((completed / totalLessons) * 100);
}

function getOverallProgress() {
    const progress = getProgress();
    let totalLessons = 0;
    let completedLessons = 0;
    
    chapters.forEach(ch => {
        // Estimate lessons per chapter (will be updated when loaded)
        const completed = progress.completedLessons[ch.file]?.length || 0;
        completedLessons += completed;
    });
    
    // We'll calculate this properly after chapters are loaded
    return { completedLessons, totalChapters: chapters.length };
}

function saveQuizScore(chapterFile, score, total) {
    const progress = getProgress();
    progress.quizScores[chapterFile] = {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        date: new Date().toISOString()
    };
    saveProgress(progress);
}

function getQuizScore(chapterFile) {
    const progress = getProgress();
    return progress.quizScores[chapterFile] || null;
}

// Reset all progress
function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This will delete all completed lessons and quiz scores.')) {
        localStorage.removeItem(PROGRESS_KEY);
        console.log('Progress reset');
        // Reload the page to reset UI
        location.reload();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadDiagramsJson();
    loadChapterList();
    // Wire Show Diagrams button
    document.getElementById('show-diagrams-btn')?.addEventListener('click', toggleDiagramsPanel);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const menu = document.querySelector('.chapter-menu');
        if (menu && !menu.contains(e.target)) {
            closeChapterMenu();
        }
    });
    
});

// Toggle chapter menu
function toggleChapterMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const dropdown = document.getElementById('chapter-dropdown');
    
    hamburger.classList.toggle('active');
    dropdown.classList.toggle('active');
}

function closeChapterMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const dropdown = document.getElementById('chapter-dropdown');
    
    hamburger.classList.remove('active');
    dropdown.classList.remove('active');
}

// Load available chapters
async function loadChapterList() {
    try {
        const response = await fetch('chapters/index.json');
        chapters = await response.json();
        
        renderChapterList();

        // Load first chapter by default
        if (chapters.length > 0) {
            loadChapter(chapters[0].file);
        }
    } catch (error) {
        console.error('Error loading chapter list:', error);
        // Fallback: try to load chapter1.json directly
        loadChapter('chapter1.json');
    }
}

// Render chapter list in dropdown
function renderChapterList() {
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';
    
    const progress = getProgress();
    
    chapters.forEach(ch => {
        const btn = document.createElement('button');
        const isActive = ch.file === currentChapterFile;
        const quizScore = progress.quizScores[ch.file];
        const completedCount = progress.completedLessons[ch.file]?.length || 0;
        
        btn.className = 'chapter-item' + (isActive ? ' active' : '');
        
        // Build chapter item content
        let statusIcon = '';
        if (quizScore && quizScore.percentage >= 80) {
            statusIcon = '<span class="chapter-status completed">✓</span>';
        } else if (completedCount > 0) {
            statusIcon = '<span class="chapter-status in-progress">◐</span>';
        }
        
        btn.innerHTML = `
            <span class="chapter-title">${ch.title}</span>
            ${statusIcon}
        `;
        btn.onclick = () => {
            loadChapter(ch.file);
            closeChapterMenu();
        };
        list.appendChild(btn);
    });
    
    // Add reset progress button to the dropdown (outside chapter-list)
    const dropdown = document.getElementById('chapter-dropdown');
    // Remove existing reset button if any
    const existingResetBtn = dropdown.querySelector('.reset-btn');
    if (existingResetBtn) existingResetBtn.remove();
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'chapter-item reset-btn';
    resetBtn.innerHTML = '<span class="chapter-title">🗑️ Reset All Progress</span>';
    resetBtn.onclick = () => {
        resetProgress();
        closeChapterMenu();
    };
    dropdown.appendChild(resetBtn);
}

// Load a specific chapter
async function loadChapter(filename) {
    try {
        const response = await fetch(`chapters/${filename}`);
        currentChapter = await response.json();
        currentChapterFile = filename;
        renderChapter();
        renderChapterList(); // Update active state
    } catch (error) {
        console.error('Error loading chapter:', error);
    }
}

// Render the entire chapter
function renderChapter() {
    if (!currentChapter) return;

    // Set theme colors
    const root = document.documentElement;
    root.style.setProperty('--theme-color', currentChapter.themeColor || '#326ce5');
    root.style.setProperty('--theme-color-dark', currentChapter.themeColorDark || '#2857b8');

    // Set header
    document.getElementById('chapter-title').textContent = currentChapter.title;
    document.getElementById('chapter-subtitle').textContent = currentChapter.subtitle || '';

    // Render navigation
    renderNavigation();

    // Render lessons
    renderLessons();

    // Render summary
    renderSummary();

    // Show first lesson
    showLesson(0);
}

// Render navigation buttons
function renderNavigation() {
    const nav = document.getElementById('lesson-nav');
    nav.innerHTML = '';

    currentChapter.lessons.forEach((lesson, index) => {
        const btn = document.createElement('button');
        const isComplete = isLessonComplete(currentChapterFile, index);
        btn.className = 'nav-btn' + (index === 0 ? ' active' : '') + (isComplete ? ' completed' : '');
        btn.innerHTML = `
            ${isComplete ? '<span class="check-icon">✓</span>' : ''}
            <span>${lesson.navTitle || lesson.title}</span>
        `;
        btn.onclick = () => showLesson(index);
        nav.appendChild(btn);
    });
    
    // Add Chapter Quiz button
    const quizBtn = document.createElement('button');
    const quizScore = getQuizScore(currentChapterFile);
    quizBtn.className = 'nav-btn chapter-quiz-btn' + (quizScore ? ' completed' : '');
    quizBtn.innerHTML = `
        <span>📝 Chapter Quiz</span>
        ${quizScore ? `<span class="quiz-score-badge">${quizScore.percentage}%</span>` : ''}
    `;
    quizBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        startChapterQuiz();
    };
    nav.appendChild(quizBtn);
}

// Render all lessons
function renderLessons() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '';

    currentChapter.lessons.forEach((lesson, index) => {
        const section = document.createElement('section');
        section.className = 'lesson' + (index !== 0 ? ' hidden' : '');
        section.id = `lesson-${index}`;
        section.innerHTML = `<h2>${lesson.title}</h2>`;

        // Render cards
        lesson.cards.forEach(card => {
            section.appendChild(renderCard(card));
        });

        // Render lab button if exists
        if (lesson.lab) {
            const labBtn = document.createElement('button');
            labBtn.className = 'lab-btn';
            labBtn.textContent = `🧪 Launch Lab: ${lesson.lab.title}`;
            labBtn.onclick = () => openLab(lesson.lab);
            section.appendChild(labBtn);
        }

        contentArea.appendChild(section);
    });

    // After rendering lessons, insert chapter diagrams from diagrams.json and initialize Mermaid for diagram blocks
    insertDiagramsForCurrentChapter();

    if (window.mermaid) {
        // Wait a tick to ensure elements are in DOM
        setTimeout(() => {
            try {
                mermaid.init(undefined, document.querySelectorAll('.mermaid'));
            } catch (e) {
                console.warn('Mermaid render error:', e);
            }
        }, 50);
    }
}

// Load diagrams mapping (called on DOMContentLoaded)
let chapterDiagrams = {};
async function loadDiagramsJson() {
    try {
        const resp = await fetch('chapters/diagrams.json');
        chapterDiagrams = await resp.json();
    } catch (e) {
        console.warn('No diagrams.json found or failed to load:', e);
        chapterDiagrams = {};
    }
}

function insertDiagramsForCurrentChapter() {
    if (!currentChapterFile || !chapterDiagrams) return;
    const list = chapterDiagrams[currentChapterFile];
    if (!list || !Array.isArray(list)) return;

    list.forEach(d => {
        const lessonIndex = Number(d.lesson || 0);
        const section = document.getElementById(`lesson-${lessonIndex}`);
        const container = section || document.getElementById('content-area');
        const el = buildDiagramElement(d);
        container.appendChild(el);
        // Render this mermaid block
        try {
            if (window.mermaid) mermaid.init(undefined, el.querySelectorAll('.mermaid'));
        } catch (e) {
            console.warn('Mermaid render error for chapter diagram:', e);
        }
    });
}

// Toggle and render diagrams panel (explicit user-facing panel)
function toggleDiagramsPanel() {
    const btn = document.getElementById('show-diagrams-btn');
    const panel = document.getElementById('diagrams-section');
    if (panel) {
        const hidden = panel.classList.toggle('hidden');
        btn.classList.toggle('active', !hidden);
        btn.setAttribute('aria-pressed', (!hidden).toString());
        if (!hidden) renderDiagramsPanel();
        return;
    }

    // Create the panel above the main content area
    const newPanel = document.createElement('section');
    newPanel.id = 'diagrams-section';
    newPanel.className = 'diagrams-section';
    const content = document.getElementById('content-area');
    content.parentNode.insertBefore(newPanel, content);
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    renderDiagramsPanel();
}

function renderDiagramsPanel() {
    const panel = document.getElementById('diagrams-section');
    if (!panel || !currentChapterFile) return;
    panel.innerHTML = `<h2>Diagrams for ${currentChapter?.title || currentChapterFile}</h2>`;

    // Chapter-level diagrams from diagrams.json
    const list = chapterDiagrams[currentChapterFile] || [];
    list.forEach(d => panel.appendChild(buildDiagramElement(d)));

    // Also include inline diagram cards present in chapter JSON
    currentChapter.lessons.forEach((lesson, li) => {
        lesson.cards.forEach(card => {
            card.content?.forEach(block => {
                if (block.type === 'diagram') {
                    const d = {
                        lesson: li,
                        title: card.title,
                        format: block.format || 'mermaid',
                        source: block.source,
                        caption: block.caption
                    };
                    panel.appendChild(buildDiagramElement(d));
                }
            });
        });
    });

    // Initialize mermaid for the panel
    try {
        if (window.mermaid) mermaid.init(undefined, panel.querySelectorAll('.mermaid'));
    } catch (e) {
        console.warn('Mermaid render error (panel):', e);
    }
}

function buildDiagramElement(d) {
    const el = document.createElement('div');
    el.className = 'diagram-block';
    const caption = d.caption ? `<div class="diagram-caption">${d.caption}</div>` : '';
    el.innerHTML = `<h3 class="diagram-title">${d.title || 'Diagram'}</h3><div class="mermaid">${d.source}</div>${caption}`;
    return el;
}

// Render a single card
function renderCard(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'lesson-card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `<h3>${card.title}</h3><span class="toggle-icon">▼</span>`;
    header.onclick = () => toggleSection(header);

    const content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = renderContent(card.content);

    cardEl.appendChild(header);
    cardEl.appendChild(content);

    return cardEl;
}

// Render content blocks
function renderContent(contentArray) {
    if (!contentArray) return '';
    
    return contentArray.map(block => {
        switch (block.type) {
            case 'text':
                return `<p>${block.value}</p>`;
            
            case 'highlight':
                return `<p class="highlight-text">${block.value}</p>`;
            
            case 'quote':
                return `<blockquote>${block.value}</blockquote>`;
            
            case 'list':
                return `<ul>${block.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
            
            case 'keypoint':
                return `<div class="key-point"><span class="badge">${block.badge || 'Key Point'}</span><p>${block.value}</p></div>`;
            
            case 'concept':
                return `<div class="concept-box"><h4>${block.title}</h4><p>${block.value}</p></div>`;
            
            case 'example':
                return `<div class="example-box"><h4>${block.title || 'Example'}</h4><p>${block.value}</p></div>`;
            
            case 'grid':
                const gridClass = `grid-${block.columns || 2}`;
                return `<div class="${gridClass}">${block.items.map(item => `
                    <div class="grid-item">
                        ${item.icon ? `<div class="icon">${item.icon}</div>` : ''}
                        ${item.title ? `<h5>${item.title}</h5>` : ''}
                        ${item.text ? `<p>${item.text}</p>` : ''}
                    </div>
                `).join('')}</div>`;
            
            case 'tags':
                return `<div class="tags">${block.items.map(tag => 
                    `<span class="tag${tag.primary ? ' primary' : ''}">${tag.text || tag}</span>`
                ).join('')}</div>`;
            
            case 'stats':
                return `<div class="stats-row">${block.items.map(stat => `
                    <div class="stat">
                        <span class="stat-number">${stat.value}</span>
                        <span class="stat-label">${stat.label}</span>
                    </div>
                `).join('')}</div>`;
            
            case 'comparison':
                return `<div class="comparison">
                    <div class="comparison-side pros">
                        <h5>${block.leftTitle || 'Pros'}</h5>
                        <ul>${block.left.map(item => `<li>✅ ${item}</li>`).join('')}</ul>
                    </div>
                    <div class="comparison-side cons">
                        <h5>${block.rightTitle || 'Cons'}</h5>
                        <ul>${block.right.map(item => `<li>❌ ${item}</li>`).join('')}</ul>
                    </div>
                </div>`;
            
            case 'nested':
                return `
                    <div class="card-header nested" onclick="toggleSection(this)">
                        <h4>${block.title}</h4>
                        <span class="toggle-icon">▼</span>
                    </div>
                    <div class="card-content nested">${renderContent(block.content)}</div>
                `;

            case 'diagram':
                // Supports Mermaid diagrams inline
                if (block.format && block.format.toLowerCase() === 'mermaid') {
                    const caption = block.caption ? `<div class="diagram-caption">${block.caption}</div>` : '';
                    // Mermaid will parse the innerText of this div
                    return `<div class="diagram-block"><div class="mermaid">${block.source}</div>${caption}</div>`;
                }
                return '';
            
            default:
                return '';
        }
    }).join('');
}

// Render summary section
function renderSummary() {
    const grid = document.getElementById('summary-grid');
    if (!currentChapter.summary) {
        document.getElementById('summary-section').style.display = 'none';
        return;
    }

    document.getElementById('summary-section').style.display = 'block';
    grid.innerHTML = currentChapter.summary.map(item => `
        <div class="summary-item">
            <span class="summary-icon">${item.icon}</span>
            <strong>${item.title}</strong>
            <p>${item.text}</p>
        </div>
    `).join('');
}

// Show specific lesson
function showLesson(index) {
    chapterQuizActive = false;
    
    // Hide chapter quiz if visible
    const quizSection = document.getElementById('chapter-quiz-section');
    if (quizSection) {
        quizSection.classList.add('hidden');
        quizSection.style.display = 'none';
    }
    
    // Show content area
    document.getElementById('content-area').classList.remove('hidden');
    document.getElementById('content-area').style.display = 'block';
    document.getElementById('summary-section').style.display = 'block';
    
    // Update nav buttons
    const navBtns = document.querySelectorAll('.nav-btn:not(.chapter-quiz-btn)');
    navBtns.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
    document.querySelector('.chapter-quiz-btn')?.classList.remove('active');

    // Show/hide lessons
    document.querySelectorAll('.lesson').forEach((lesson, i) => {
        lesson.classList.toggle('hidden', i !== index);
    });

    // Mark lesson as complete after viewing
    markLessonComplete(currentChapterFile, index);
    
    // Update nav to show completion
    renderNavigation();
    // Re-highlight current lesson
    const updatedNavBtns = document.querySelectorAll('.nav-btn:not(.chapter-quiz-btn)');
    updatedNavBtns.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    // Scroll to top
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

// Toggle section visibility
function toggleSection(header) {
    const content = header.nextElementSibling;
    if (content && content.classList.contains('card-content')) {
        content.classList.toggle('hidden');
        header.classList.toggle('collapsed');
    }
}

// ============================================
// LAB FUNCTIONS
// ============================================

function openLab(lab) {
    currentLab = lab;
    document.getElementById('lab-overlay').classList.remove('hidden');
    document.getElementById('lab-panel').classList.remove('hidden');
    document.getElementById('lab-title').textContent = `🧪 Lab: ${lab.title}`;
    document.body.style.overflow = 'hidden';

    renderLab(lab);
}

function closeLab() {
    document.getElementById('lab-overlay').classList.add('hidden');
    document.getElementById('lab-panel').classList.add('hidden');
    document.body.style.overflow = '';
    currentLab = null;
}

function renderLab(lab) {
    const content = document.getElementById('lab-content');
    
    if (lab.type === 'quiz') {
        content.innerHTML = renderQuizLab(lab);
    } else if (lab.type === 'dragdrop') {
        content.innerHTML = renderDragDropLab(lab);
    }

    content.innerHTML += `
        <button class="check-btn" onclick="checkLab()">Check Answers</button>
        <div class="lab-result" id="lab-result"></div>
    `;
}

function renderQuizLab(lab) {
    return `<div class="quiz-lab">${lab.questions.map((q, i) => `
        <div class="quiz-question" data-answer="${q.answer}">
            <p>${i + 1}. ${q.question}</p>
            <div class="quiz-options${q.multi ? ' multi' : ''}">
                ${q.options.map((opt, j) => `
                    <label>
                        <input type="${q.multi ? 'checkbox' : 'radio'}" name="q${i}" value="${opt.value || j}">
                        ${opt.text || opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('')}</div>`;
}

function renderDragDropLab(lab) {
    return `
        <p>${lab.instructions}</p>
        <div class="drag-drop-area">
            <div class="drop-zones">
                ${lab.zones.map(zone => `
                    <div class="drop-zone" id="zone-${zone.id}" data-zone="${zone.id}" 
                         ondrop="drop(event)" ondragover="allowDrop(event)">
                        <h4>${zone.title}</h4>
                    </div>
                `).join('')}
            </div>
            <div class="drag-items" id="drag-items">
                ${lab.items.map((item, i) => `
                    <div class="drag-item" draggable="true" ondragstart="drag(event)" 
                         id="item-${i}" data-answer="${item.zone}">${item.text}</div>
                `).join('')}
            </div>
        </div>
    `;
}

// Drag and drop handlers
function allowDrop(ev) {
    ev.preventDefault();
    ev.target.closest('.drop-zone').style.borderColor = 'var(--theme-color, #326ce5)';
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const dropZone = ev.target.closest('.drop-zone');
    dropZone.style.borderColor = '';
    
    const itemId = ev.dataTransfer.getData("text");
    const item = document.getElementById(itemId);
    if (item) {
        dropZone.appendChild(item);
    }
}

// Check lab answers
function checkLab() {
    if (!currentLab) return;

    let correct = 0;
    let total = 0;

    if (currentLab.type === 'quiz') {
        currentLab.questions.forEach((q, i) => {
            total++;
            if (q.multi) {
                const selected = Array.from(document.querySelectorAll(`input[name="q${i}"]:checked`))
                    .map(input => input.value).sort();
                const answer = (Array.isArray(q.answer) ? q.answer : [q.answer]).sort();
                if (arraysEqual(selected, answer)) correct++;
            } else {
                const selected = document.querySelector(`input[name="q${i}"]:checked`);
                if (selected && selected.value == q.answer) correct++;
            }
        });
    } else if (currentLab.type === 'dragdrop') {
        currentLab.items.forEach((item, i) => {
            total++;
            const el = document.getElementById(`item-${i}`);
            const zone = el.closest('.drop-zone');
            if (zone && zone.dataset.zone === item.zone) {
                el.classList.add('correct');
                el.classList.remove('incorrect');
                correct++;
            } else if (zone) {
                el.classList.add('incorrect');
                el.classList.remove('correct');
            }
        });
    }

    showResult(correct, total);
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function showResult(correct, total) {
    const result = document.getElementById('lab-result');
    const percentage = (correct / total) * 100;

    if (percentage === 100) {
        result.textContent = `🎉 Perfect! ${correct}/${total} correct!`;
        result.className = 'lab-result success';
    } else if (percentage >= 50) {
        result.textContent = `👍 Good job! ${correct}/${total} correct. Keep practicing!`;
        result.className = 'lab-result partial';
    } else {
        result.textContent = `📚 ${correct}/${total} correct. Review the lesson and try again!`;
        result.className = 'lab-result error';
    }
}

// Close lab on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentLab) {
        closeLab();
    }
});

// ============================================
// CHAPTER QUIZ FUNCTIONALITY
// ============================================

function generateChapterQuiz() {
    if (!currentChapter) return [];
    
    const questions = [];
    
    // Collect all labs with quiz type from the chapter
    currentChapter.lessons.forEach((lesson, lessonIndex) => {
        if (lesson.lab && lesson.lab.type === 'quiz') {
            lesson.lab.questions.forEach((q, qIndex) => {
                questions.push({
                    ...q,
                    lessonIndex,
                    lessonTitle: lesson.navTitle || lesson.title,
                    originalIndex: qIndex
                });
            });
        }
    });
    
    // If no quiz questions found, generate from content
    if (questions.length === 0) {
        // Create basic comprehension questions from key points
        currentChapter.lessons.forEach((lesson, lessonIndex) => {
            lesson.cards?.forEach(card => {
                card.content?.forEach(block => {
                    if (block.type === 'keypoint' || block.type === 'concept') {
                        questions.push({
                            question: `What is the key concept about: ${card.title}?`,
                            options: ['Review the lesson content'],
                            answer: 0,
                            lessonIndex,
                            lessonTitle: lesson.navTitle || lesson.title,
                            isReview: true
                        });
                    }
                });
            });
        });
    }
    
    // Shuffle and limit to reasonable number
    return shuffleArray(questions).slice(0, Math.min(15, questions.length));
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function startChapterQuiz() {
    chapterQuizActive = true;
    chapterQuizAnswers = {};
    
    // Hide lessons and summary
    const contentArea = document.getElementById('content-area');
    contentArea.classList.add('hidden');
    contentArea.style.display = 'none';
    document.getElementById('summary-section').style.display = 'none';
    
    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.chapter-quiz-btn')?.classList.add('active');
    
    // Create or show quiz section
    let quizSection = document.getElementById('chapter-quiz-section');
    if (!quizSection) {
        quizSection = document.createElement('section');
        quizSection.id = 'chapter-quiz-section';
        quizSection.className = 'chapter-quiz-section';
        // Insert after the nav, before the content-area
        const nav = document.getElementById('lesson-nav');
        nav.parentNode.insertBefore(quizSection, nav.nextSibling);
    }
    
    const questions = generateChapterQuiz();
    const previousScore = getQuizScore(currentChapterFile);
    
    quizSection.innerHTML = `
        <div class="chapter-quiz-container">
            <div class="quiz-header">
                <h2>📝 Chapter Quiz: ${currentChapter.title}</h2>
                <p class="quiz-subtitle">Test your knowledge of this chapter</p>
                ${previousScore ? `<p class="previous-score">Previous best: ${previousScore.percentage}% (${previousScore.score}/${previousScore.total})</p>` : ''}
            </div>
            
            <div class="quiz-progress-bar">
                <div class="quiz-progress-fill" id="quizProgressFill" style="width: 0%"></div>
            </div>
            <p class="quiz-progress-text" id="quizProgressText">Question 1 of ${questions.length}</p>
            
            <div class="quiz-questions" id="chapterQuizQuestions">
                ${questions.map((q, i) => renderChapterQuizQuestion(q, i, questions.length)).join('')}
            </div>
            
            <div class="quiz-actions">
                <button class="quiz-submit-btn" id="submitChapterQuiz" onclick="submitChapterQuiz()">
                    Submit Quiz
                </button>
            </div>
            
            <div class="quiz-results hidden" id="chapterQuizResults"></div>
        </div>
    `;
    
    quizSection.classList.remove('hidden');
    quizSection.style.display = 'block';
    
    // Store questions for grading
    quizSection.dataset.questions = JSON.stringify(questions);
    
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

function renderChapterQuizQuestion(q, index, total) {
    if (q.isReview) {
        return `
            <div class="chapter-quiz-question review-item" data-index="${index}">
                <p class="question-number">Review Item ${index + 1}</p>
                <p class="question-text">${q.question}</p>
                <p class="lesson-ref">From: ${q.lessonTitle}</p>
                <button class="review-lesson-btn" onclick="showLesson(${q.lessonIndex})">Review Lesson</button>
            </div>
        `;
    }
    
    const inputType = q.multi ? 'checkbox' : 'radio';
    
    return `
        <div class="chapter-quiz-question" data-index="${index}">
            <p class="question-number">Question ${index + 1} of ${total}</p>
            <p class="question-text">${q.question}</p>
            <p class="lesson-ref">From: ${q.lessonTitle}</p>
            <div class="chapter-quiz-options">
                ${q.options.map((opt, optIndex) => `
                    <label class="chapter-quiz-option">
                        <input type="${inputType}" 
                               name="chapter-q-${index}" 
                               value="${opt.value !== undefined ? opt.value : optIndex}"
                               onchange="updateQuizAnswer(${index}, this)">
                        <span class="option-text">${opt.text || opt}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

function updateQuizAnswer(questionIndex, input) {
    const questions = JSON.parse(document.getElementById('chapter-quiz-section').dataset.questions);
    const q = questions[questionIndex];
    
    if (q.multi) {
        if (!chapterQuizAnswers[questionIndex]) {
            chapterQuizAnswers[questionIndex] = [];
        }
        if (input.checked) {
            chapterQuizAnswers[questionIndex].push(input.value);
        } else {
            chapterQuizAnswers[questionIndex] = chapterQuizAnswers[questionIndex].filter(v => v !== input.value);
        }
    } else {
        chapterQuizAnswers[questionIndex] = input.value;
    }
    
    // Update progress
    const answered = Object.keys(chapterQuizAnswers).length;
    const total = questions.filter(q => !q.isReview).length;
    const percentage = Math.round((answered / total) * 100);
    
    document.getElementById('quizProgressFill').style.width = `${percentage}%`;
    document.getElementById('quizProgressText').textContent = `${answered} of ${total} answered`;
}

function submitChapterQuiz() {
    const questions = JSON.parse(document.getElementById('chapter-quiz-section').dataset.questions);
    const gradableQuestions = questions.filter(q => !q.isReview);
    
    let correct = 0;
    const results = [];
    
    gradableQuestions.forEach((q, i) => {
        const originalIndex = questions.indexOf(q);
        const userAnswer = chapterQuizAnswers[originalIndex];
        let isCorrect = false;
        
        if (q.multi) {
            const correctAnswers = (Array.isArray(q.answer) ? q.answer : [q.answer]).map(String).sort();
            const userAnswers = (userAnswer || []).map(String).sort();
            isCorrect = arraysEqual(correctAnswers, userAnswers);
        } else {
            isCorrect = String(userAnswer) === String(q.answer);
        }
        
        if (isCorrect) correct++;
        
        results.push({
            question: q.question,
            correct: isCorrect,
            userAnswer,
            correctAnswer: q.answer,
            lessonTitle: q.lessonTitle,
            lessonIndex: q.lessonIndex
        });
        
        // Highlight question
        const questionEl = document.querySelector(`.chapter-quiz-question[data-index="${originalIndex}"]`);
        if (questionEl) {
            questionEl.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    });
    
    const total = gradableQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    
    // Save score
    saveQuizScore(currentChapterFile, correct, total);
    
    // Show results
    const resultsDiv = document.getElementById('chapterQuizResults');
    resultsDiv.innerHTML = `
        <div class="results-header ${percentage >= 80 ? 'pass' : percentage >= 60 ? 'partial' : 'fail'}">
            <h3>${percentage >= 80 ? '🎉 Excellent!' : percentage >= 60 ? '👍 Good Job!' : '📚 Keep Studying!'}</h3>
            <div class="score-display">
                <span class="score-number">${correct}</span>
                <span class="score-divider">/</span>
                <span class="score-total">${total}</span>
            </div>
            <p class="score-percentage">${percentage}%</p>
        </div>
        
        <div class="results-breakdown">
            <h4>Review Your Answers:</h4>
            ${results.map((r, i) => `
                <div class="result-item ${r.correct ? 'correct' : 'incorrect'}">
                    <span class="result-icon">${r.correct ? '✓' : '✗'}</span>
                    <div class="result-content">
                        <p class="result-question">${r.question}</p>
                        ${!r.correct ? `<p class="result-hint">Review: ${r.lessonTitle}</p>` : ''}
                    </div>
                    ${!r.correct ? `<button class="review-btn" onclick="showLesson(${r.lessonIndex})">Review</button>` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="results-actions">
            <button class="retake-btn" onclick="startChapterQuiz()">Retake Quiz</button>
            <button class="continue-btn" onclick="showLesson(0)">Back to Lessons</button>
        </div>
    `;
    resultsDiv.classList.remove('hidden');
    
    // Hide submit button
    document.getElementById('submitChapterQuiz').classList.add('hidden');
    
    // Update chapter list to show completion
    renderChapterList();
    renderNavigation();
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// PROGRESS UI UPDATE
// ============================================

function updateProgressUI() {
    // Update navigation buttons with completion status
    if (currentChapter && currentChapterFile) {
        const navBtns = document.querySelectorAll('.nav-btn:not(.chapter-quiz-btn)');
        navBtns.forEach((btn, i) => {
            if (isLessonComplete(currentChapterFile, i)) {
                btn.classList.add('completed');
            }
        });
    }
}
