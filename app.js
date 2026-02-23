/* ============================================
   HANDWRITTEN JOURNAL - Page Flip JavaScript
   Realistic Book Page Turning Effect
   WITH DATE-BASED ENTRIES
   ============================================ */

// ============================================
// VARIABLES
// ============================================
let currentPage = 0;
const totalPages = 6;
let isAnimating = false;
let currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

// ============================================
// HIGHLIGHT FUNCTIONS
// ============================================
function highlightSelection(color) {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        showToast('Select some text first! ✏️');
        return;
    }
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText.trim()) {
        showToast('Select some text first! ✏️');
        return;
    }
    
    // Create highlight span
    const highlightSpan = document.createElement('span');
    highlightSpan.className = `highlight-${color}`;
    
    try {
        range.surroundContents(highlightSpan);
        selection.removeAllRanges();
        showToast(`Highlighted in ${color}! ✨`);
        autoSave();
    } catch (e) {
        // If selection spans multiple elements, use alternative method
        const fragment = range.extractContents();
        highlightSpan.appendChild(fragment);
        range.insertNode(highlightSpan);
        selection.removeAllRanges();
        showToast(`Highlighted in ${color}! ✨`);
        autoSave();
    }
}

function removeHighlight() {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        showToast('Select highlighted text to remove! ✏️');
        return;
    }
    
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Find the highlight span
    let highlightSpan = container.nodeType === 3 ? container.parentElement : container;
    
    if (highlightSpan && highlightSpan.className && highlightSpan.className.startsWith('highlight-')) {
        const parent = highlightSpan.parentNode;
        while (highlightSpan.firstChild) {
            parent.insertBefore(highlightSpan.firstChild, highlightSpan);
        }
        parent.removeChild(highlightSpan);
        showToast('Highlight removed! ✨');
        autoSave();
    } else {
        showToast('Select highlighted text to remove! ✏️');
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeBook();
    initializeDatePicker();
    setCurrentDate();
    initializeEditableElements();
    loadDateEntry(currentDate);
    loadTheme();
    updateNavButtons();
    updatePageIndicator();
    populateEntriesList();
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
});

// ============================================
// BOOK INITIALIZATION
// ============================================
function initializeBook() {
    const pages = document.querySelectorAll('.page');
    
    // Set initial z-index for proper stacking
    pages.forEach((page, index) => {
        page.style.zIndex = totalPages - index;
    });
    
    // Add click listeners to pages
    pages.forEach((page, index) => {
        page.addEventListener('click', (e) => {
            // Don't flip if clicking on editable content or interactive elements
            if (e.target.hasAttribute('contenteditable') || 
                e.target.tagName === 'INPUT' ||
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'TEXTAREA' ||
                e.target.closest('button') ||
                e.target.closest('.memory-photo-slot') ||
                e.target.closest('.add-btn') ||
                e.target.closest('.photo-placeholder') ||
                e.target.closest('.vision-item') ||
                e.target.closest('.polaroid') ||
                e.target.closest('.delete-img') ||
                e.target.closest('.photo-caption') ||
                e.target.closest('.goal-item') ||
                e.target.closest('.goal-text') ||
                e.target.closest('.goal-check') ||
                e.target.closest('.dream-slip') ||
                e.target.closest('.paper-star') ||
                e.target.closest('.wish-input') ||
                e.target.closest('.fold-btn') ||
                e.target.closest('.affirmation-item') ||
                e.target.closest('.blessing-card') ||
                e.target.closest('.gratitude-item') ||
                e.target.closest('[contenteditable]') ||
                e.target.closest('label') ||
                e.target.closest('input') ||
                e.target.closest('span[contenteditable]')) {
                return;
            }
            
            // Determine if clicked on left or right side of page
            const rect = page.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pageWidth = rect.width;
            
            if (clickX < pageWidth / 2) {
                prevPage();
            } else {
                nextPage();
            }
        });
    });
}

// ============================================
// PAGE NAVIGATION
// ============================================
function nextPage() {
    if (isAnimating || currentPage >= totalPages) return;
    
    isAnimating = true;
    const page = document.getElementById(`page${currentPage + 1}`);
    
    if (page) {
        page.classList.add('flipped');
        
        // Update z-index for flipped pages
        updateZIndex();
        
        currentPage++;
        
        // Play page flip sound effect (optional)
        playFlipSound();
        
        setTimeout(() => {
            isAnimating = false;
            updateNavButtons();
            updatePageIndicator();
            autoSave();
        }, 800);
    }
}

function prevPage() {
    if (isAnimating || currentPage <= 0) return;
    
    isAnimating = true;
    const page = document.getElementById(`page${currentPage}`);
    
    if (page) {
        page.classList.remove('flipped');
        
        currentPage--;
        
        // Update z-index for flipped pages
        updateZIndex();
        
        // Play page flip sound effect (optional)
        playFlipSound();
        
        setTimeout(() => {
            isAnimating = false;
            updateNavButtons();
            updatePageIndicator();
        }, 800);
    }
}

function goToPage(pageNum) {
    if (pageNum < 0 || pageNum > totalPages) return;
    
    // Flip pages until we reach the target
    if (pageNum > currentPage) {
        const interval = setInterval(() => {
            if (currentPage < pageNum) {
                nextPage();
            } else {
                clearInterval(interval);
            }
        }, 900);
    } else if (pageNum < currentPage) {
        const interval = setInterval(() => {
            if (currentPage > pageNum) {
                prevPage();
            } else {
                clearInterval(interval);
            }
        }, 900);
    }
}

// ============================================
// Z-INDEX MANAGEMENT
// ============================================
function updateZIndex() {
    const pages = document.querySelectorAll('.page');
    
    pages.forEach((page, index) => {
        if (page.classList.contains('flipped')) {
            page.style.zIndex = index + 1;
        } else {
            page.style.zIndex = totalPages - index;
        }
    });
}

// ============================================
// UI UPDATES
// ============================================
function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

function updatePageIndicator() {
    const currentPageNum = document.getElementById('currentPageNum');
    const totalPagesEl = document.getElementById('totalPages');
    
    if (currentPageNum) {
        currentPageNum.textContent = currentPage + 1;
    }
    
    if (totalPagesEl) {
        totalPagesEl.textContent = totalPages;
    }
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================
function handleKeyboard(e) {
    // Don't handle if user is typing in editable content
    if (e.target.hasAttribute('contenteditable') || e.target.tagName === 'INPUT') {
        // But still handle save shortcut
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveJournal();
        }
        return;
    }
    
    switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
            e.preventDefault();
            nextPage();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            prevPage();
            break;
        case 'Home':
            e.preventDefault();
            goToPage(0);
            break;
        case 'End':
            e.preventDefault();
            goToPage(totalPages);
            break;
    }
    
    // Save shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveJournal();
    }
}

// ============================================
// SET CURRENT DATE
// ============================================
function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date(currentDate);
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
    
    // Update letter date
    const letterDate = document.querySelector('.letter-date');
    if (letterDate && !letterDate.dataset.userEdited) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        letterDate.textContent = new Date(currentDate).toLocaleDateString('en-US', options);
    }
}

// ============================================
// DATE PICKER & NAVIGATION
// ============================================
function initializeDatePicker() {
    const datePicker = document.getElementById('journalDate');
    if (datePicker) {
        datePicker.value = currentDate;
        datePicker.max = new Date().toISOString().split('T')[0]; // Can't go to future
    }
}

function previousDay() {
    saveCurrentEntry(); // Save before navigating
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    currentDate = date.toISOString().split('T')[0];
    document.getElementById('journalDate').value = currentDate;
    loadDateEntry(currentDate);
}

function nextDay() {
    const today = new Date().toISOString().split('T')[0];
    if (currentDate >= today) return; // Can't go to future
    
    saveCurrentEntry(); // Save before navigating
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    currentDate = date.toISOString().split('T')[0];
    document.getElementById('journalDate').value = currentDate;
    loadDateEntry(currentDate);
}

function goToToday() {
    saveCurrentEntry(); // Save before navigating
    currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('journalDate').value = currentDate;
    loadDateEntry(currentDate);
}

// ============================================
// ENTRIES SIDEBAR
// ============================================
function toggleEntriesList() {
    const sidebar = document.getElementById('entriesSidebar');
    sidebar.classList.toggle('open');
    if (sidebar.classList.contains('open')) {
        populateEntriesList();
    }
}

function populateEntriesList() {
    const listContainer = document.getElementById('entriesList');
    if (!listContainer) return;
    
    const allEntries = getAllEntries();
    
    if (allEntries.length === 0) {
        listContainer.innerHTML = `
            <div class="no-entries">
                <span>📝</span>
                <p>No entries yet!</p>
                <p>Start writing today ♡</p>
            </div>
        `;
        return;
    }
    
    // Sort entries by date (newest first)
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    listContainer.innerHTML = allEntries.map(entry => {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        const preview = entry.preview || 'No content yet...';
        const isActive = entry.date === currentDate ? 'active' : '';
        
        return `
            <div class="entry-item ${isActive}" onclick="loadEntryFromList('${entry.date}')">
                <div class="entry-date">📅 ${formattedDate}</div>
                <div class="entry-preview">${preview}</div>
            </div>
        `;
    }).join('');
}

function loadEntryFromList(dateStr) {
    saveCurrentEntry();
    currentDate = dateStr;
    document.getElementById('journalDate').value = currentDate;
    loadDateEntry(currentDate);
    toggleEntriesList(); // Close sidebar
}

function getAllEntries() {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('journal_')) {
            const dateStr = key.replace('journal_', '');
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const preview = data.letter?.body?.substring(0, 80) || 
                               data.notes?.content?.substring(0, 80) || 
                               '';
                entries.push({
                    date: dateStr,
                    preview: preview
                });
            } catch (e) {
                console.error('Error parsing entry:', e);
            }
        }
    }
    return entries;
}

// ============================================
// EDITABLE ELEMENTS
// ============================================
function initializeEditableElements() {
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    
    editableElements.forEach(element => {
        // Prevent page flip when editing
        element.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Auto-save on blur
        element.addEventListener('blur', () => {
            autoSave();
        });
        
        // Paste as plain text
        element.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    });
    
    // Also prevent checkboxes from triggering page flip
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

// ============================================
// ADD GRATITUDE CARD
// ============================================
function addGratitude() {
    const grid = document.getElementById('gratitudeGrid');
    if (!grid) return;
    
    const rotations = [-2, -1, 0, 1, 2, 3];
    const rotation = rotations[Math.floor(Math.random() * rotations.length)];
    
    const card = document.createElement('div');
    card.className = 'gratitude-card';
    card.style.setProperty('--rotate', `${rotation}deg`);
    card.innerHTML = `
        <div class="card-tape"></div>
        <div class="card-text" contenteditable="true" data-placeholder="I'm grateful for..."></div>
        <span class="card-heart">♡</span>
    `;
    
    grid.appendChild(card);
    
    // Focus on the new card
    const textElement = card.querySelector('.card-text');
    textElement.focus();
    
    // Add event listeners
    textElement.addEventListener('click', e => e.stopPropagation());
    textElement.addEventListener('blur', autoSave);
    
    showToast('New blessing added! ✨');
}

// ============================================
// ADD DREAM / FOLD WISH INTO STAR
// ============================================
function addDream() {
    const container = document.getElementById('dreamNotes');
    if (!container) return;
    
    const rotations = [-5, -3, -1, 1, 3, 5];
    const rotation = rotations[Math.floor(Math.random() * rotations.length)];
    
    const slip = document.createElement('div');
    slip.className = 'dream-slip';
    slip.style.setProperty('--rotate', `${rotation}deg`);
    slip.setAttribute('contenteditable', 'true');
    slip.setAttribute('data-placeholder', 'A dream...');
    slip.textContent = '';
    
    container.appendChild(slip);
    slip.focus();
    
    slip.addEventListener('click', e => e.stopPropagation());
    slip.addEventListener('blur', autoSave);
    
    showToast('Dream added! ⭐');
}

// Fold wish into a paper star
function foldWishIntoStar() {
    const input = document.getElementById('wishInput');
    const container = document.getElementById('dreamStars');
    
    if (!input || !container) return;
    
    const wishText = input.value.trim();
    if (!wishText) {
        showToast('Write a wish first! ✏️');
        return;
    }
    
    // Random hue for star color (colorful range)
    const hues = [0, 30, 45, 60, 120, 180, 200, 240, 280, 300, 330, 350];
    const hue = hues[Math.floor(Math.random() * hues.length)];
    
    // Create the colorful paper star element
    const star = document.createElement('div');
    star.className = 'paper-star new-star';
    star.style.setProperty('--hue', hue);
    star.setAttribute('title', wishText);
    star.onclick = function(e) { 
        e.stopPropagation();
        showWish(this);
    };
    
    // Add folding animation effect
    showToast('Folding your wish... ✨');
    
    // Clear input
    input.value = '';
    
    // Add star to jar with animation
    setTimeout(() => {
        container.appendChild(star);
        showToast('Wish added to the jar! ⭐');
        
        // Remove the new-star class after animation
        setTimeout(() => {
            star.classList.remove('new-star');
        }, 800);
        
        autoSave();
    }, 300);
}

// Show wish when clicking on a star
function showWish(star) {
    const wish = star.getAttribute('title');
    if (wish) {
        // Create floating wish display
        const wishDisplay = document.createElement('div');
        wishDisplay.className = 'wish-popup';
        wishDisplay.innerHTML = `
            <div class="wish-popup-content">
                <span class="wish-popup-star">⭐</span>
                <p>${wish}</p>
                <button onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        document.body.appendChild(wishDisplay);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (wishDisplay.parentElement) {
                wishDisplay.remove();
            }
        }, 3000);
    }
}

// ============================================
// DREAM IMAGE UPLOAD
// ============================================
function uploadDreamImage(slot) {
    const input = slot.querySelector('input[type="file"]');
    if (input) input.click();
}

function handleDreamImageUpload(event, slot) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB for localStorage)
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large! Max 2MB 📷');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create image element
        const img = document.createElement('img');
        img.src = e.target.result;
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-img';
        deleteBtn.innerHTML = '✕';
        deleteBtn.onclick = function(ev) {
            ev.stopPropagation();
            slot.classList.remove('has-image');
            slot.innerHTML = `
                <span class="upload-icon">📷</span>
                <span class="upload-text">Add Photo</span>
                <input type="file" accept="image/*" onchange="handleDreamImageUpload(event, this.parentElement)" hidden>
            `;
            autoSave();
        };
        
        // Clear slot and add image
        slot.innerHTML = '';
        slot.appendChild(img);
        slot.appendChild(deleteBtn);
        slot.appendChild(event.target); // Keep input for re-upload
        slot.classList.add('has-image');
        
        autoSave();
        showToast('Photo added! 📸');
    };
    reader.readAsDataURL(file);
}

function addDreamImageSlot() {
    const container = document.getElementById('dreamImages');
    if (!container) return;
    
    const slot = document.createElement('div');
    slot.className = 'dream-image-slot';
    slot.onclick = function() { uploadDreamImage(this); };
    slot.innerHTML = `
        <span class="upload-icon">📷</span>
        <span class="upload-text">Add Photo</span>
        <input type="file" accept="image/*" onchange="handleDreamImageUpload(event, this.parentElement)" hidden>
    `;
    
    container.appendChild(slot);
    showToast('Photo slot added! ✨');
}

// ============================================
// VISION BOARD IMAGE UPLOAD
// ============================================
function uploadVisionImage(item) {
    const input = item.querySelector('input[type="file"]');
    if (input) input.click();
}

function handleVisionImageUpload(event, item) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB for localStorage)
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large! Max 2MB 📷');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create image element
        const img = document.createElement('img');
        img.src = e.target.result;
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-img';
        deleteBtn.innerHTML = '✕';
        deleteBtn.onclick = function(ev) {
            ev.stopPropagation();
            item.classList.remove('has-image');
            item.innerHTML = `
                <input type="file" accept="image/*" onchange="handleVisionImageUpload(event, this.parentElement)" hidden>
                <span class="vision-placeholder">📌 Add Image</span>
            `;
            autoSave();
        };
        
        // Clear item and add image
        item.innerHTML = '';
        item.appendChild(img);
        item.appendChild(deleteBtn);
        const newInput = document.createElement('input');
        newInput.type = 'file';
        newInput.accept = 'image/*';
        newInput.hidden = true;
        newInput.onchange = function(ev) { handleVisionImageUpload(ev, item); };
        item.appendChild(newInput);
        item.classList.add('has-image');
        
        autoSave();
        showToast('Vision board updated! 🎯');
    };
    reader.readAsDataURL(file);
}

function addVisionSlot() {
    const board = document.getElementById('visionBoard');
    if (!board) return;
    
    const item = document.createElement('div');
    item.className = 'vision-item';
    item.onclick = function() { uploadVisionImage(this); };
    item.innerHTML = `
        <input type="file" accept="image/*" onchange="handleVisionImageUpload(event, this.parentElement)" hidden>
        <span class="vision-placeholder">📌 Add Image</span>
    `;
    
    board.appendChild(item);
    showToast('Vision slot added! ✨');
}

// ============================================
// MEMORY LANE IMAGE UPLOAD
// ============================================
function uploadMemoryImage(slot) {
    // Prevent multiple clicks
    if (slot.classList.contains('uploading')) return;
    
    let input = slot.querySelector('input[type="file"]');
    
    // If no input exists, create one
    if (!input) {
        input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.hidden = true;
        input.onchange = function(ev) { handleMemoryImageUpload(ev, slot); };
        slot.appendChild(input);
    }
    
    // Trigger click on the file input
    input.click();
}

function handleMemoryImageUpload(event, slot) {
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, file.size);
    showToast('Processing image... ⏳');
    
    // Create image to resize
    const img = new Image();
    const reader = new FileReader();
    
    reader.onerror = function() {
        console.error('Error reading file');
        showToast('Error reading file ❌');
    };
    
    reader.onload = function(e) {
        img.onload = function() {
            // Resize image to max 800px and compress
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let width = img.width;
            let height = img.height;
            const maxSize = 800;
            
            if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to compressed JPEG
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            // Create display image element
            const displayImg = document.createElement('img');
            displayImg.src = compressedDataUrl;
            displayImg.style.width = '100%';
            displayImg.style.height = '120px';
            displayImg.style.objectFit = 'cover';
            displayImg.style.borderRadius = '3px';
            
            // Create caption input
            const caption = document.createElement('div');
            caption.className = 'photo-caption';
            caption.contentEditable = 'true';
            caption.textContent = 'Add caption...';
            caption.onclick = function(ev) { ev.stopPropagation(); };
            caption.onblur = autoSave;
            
            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-img';
            deleteBtn.innerHTML = '✕';
            deleteBtn.onclick = function(ev) {
                ev.stopPropagation();
                slot.classList.remove('has-image');
                slot.innerHTML = `
                    <input type="file" accept="image/*" onchange="handleMemoryImageUpload(event, this.parentElement)" hidden>
                    <span class="photo-placeholder">📷<br>Add Memory</span>
                `;
                autoSave();
            };
            
            // Clear slot and add image
            slot.innerHTML = '';
            slot.appendChild(displayImg);
            slot.appendChild(caption);
            slot.appendChild(deleteBtn);
            
            const newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.accept = 'image/*';
            newInput.hidden = true;
            newInput.onchange = function(ev) { handleMemoryImageUpload(ev, slot); };
            slot.appendChild(newInput);
            
            slot.classList.add('has-image');
            
            autoSave();
            showToast('Memory added! 📸');
        };
        
        img.onerror = function() {
            console.error('Error loading image');
            showToast('Error loading image ❌');
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function addMemorySlot() {
    const container = document.getElementById('memoryPhotos');
    if (!container) return;
    
    const slot = document.createElement('div');
    slot.className = 'memory-photo-slot';
    slot.onclick = function(e) { 
        e.stopPropagation(); 
        uploadMemoryImage(this); 
    };
    slot.innerHTML = `
        <input type="file" accept="image/*" hidden>
        <span class="photo-placeholder">📷<br>Add Memory</span>
    `;
    
    // Attach the onchange handler properly
    const input = slot.querySelector('input[type="file"]');
    input.onchange = function(ev) { handleMemoryImageUpload(ev, slot); };
    
    container.appendChild(slot);
    showToast('Photo slot added! ✨');
}

// ============================================
// ADD GOAL
// ============================================
let goalCount = 4;

function addGoal() {
    const checklist = document.getElementById('goalsChecklist');
    if (!checklist) return;
    
    goalCount++;
    
    const goalItem = document.createElement('div');
    goalItem.className = 'goal-item';
    goalItem.onclick = function(e) { e.stopPropagation(); };
    goalItem.innerHTML = `
        <input type="checkbox" class="goal-check" onclick="event.stopPropagation()">
        <span class="goal-text" contenteditable="true" onclick="event.stopPropagation()">New goal...</span>
    `;
    
    checklist.appendChild(goalItem);
    
    const textElement = goalItem.querySelector('.goal-text');
    const checkbox = goalItem.querySelector('.goal-check');
    
    // Select all text for easy replacement
    textElement.focus();
    const range = document.createRange();
    range.selectNodeContents(textElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    textElement.addEventListener('click', e => e.stopPropagation());
    checkbox.addEventListener('click', e => e.stopPropagation());
    textElement.addEventListener('blur', autoSave);
    
    showToast('Goal added! 💪');
}

// ============================================
// SAVE JOURNAL (DATE-BASED)
// ============================================
function saveJournal() {
    saveCurrentEntry();
    backupToServer(); // Also backup to server JSON file
    showToast('Journal saved! 💾');
}

function saveCurrentEntry() {
    const data = collectJournalData();
    
    try {
        localStorage.setItem(`journal_${currentDate}`, JSON.stringify(data));
        localStorage.setItem('journal_lastDate', currentDate);
        localStorage.setItem('journal_lastPage', currentPage.toString());
        populateEntriesList(); // Update sidebar
    } catch (error) {
        console.error('Error saving:', error);
    }
}

function autoSave() {
    saveCurrentEntry();
}

function collectJournalData() {
    const data = {
        cover: {
            title: document.querySelector('.journal-title')?.innerText || '',
            subtitle: document.querySelector('.journal-subtitle')?.innerText || '',
            owner: document.querySelector('.owner-name')?.innerText || ''
        },
        dedication: document.querySelector('.dedication-text')?.innerText || '',
        dedicationDate: document.querySelector('.dedication-date')?.innerText || '',
        letter: {
            date: document.querySelector('.letter-date')?.innerText || '',
            greeting: document.querySelector('.letter-greeting')?.innerText || '',
            body: document.querySelector('.letter-body')?.innerText || ''
        },
        continued: document.querySelector('.continued-writing')?.innerText || '',
        stickyNote: document.querySelector('.sticky-note')?.innerText || '',
        gratitude: {
            title: document.querySelector('#page3 .section-title')?.innerText || '',
            subtitle: document.querySelector('.section-subtitle')?.innerText || '',
            cards: [],
            list: [],
            quote: document.querySelector('.quote-box p')?.innerText || ''
        },
        dreams: {
            title: document.querySelector('#page4 .section-title')?.innerText || '',
            dreams: [],
            dreamImages: [],
            goalsTitle: document.querySelector('.goals-title')?.innerText || '',
            visionImages: []
        },
        memories: {
            title: document.querySelector('#page5 .section-title')?.innerText || '',
            polaroids: [],
            memoryText: document.querySelector('.memory-text')?.innerText || '',
            memoryDate: document.querySelector('.memory-date')?.innerText || ''
        },
        notes: {
            title: document.querySelector('#page6 .section-title')?.innerText || '',
            content: document.querySelector('.free-writing')?.innerText || ''
        },
        backCover: {
            quote: document.querySelector('.closing-quote')?.innerText || ''
        }
    };
    
    // Collect gratitude cards
    document.querySelectorAll('.gratitude-card .card-text').forEach(card => {
        data.gratitude.cards.push(card.innerText);
    });
    
    // Collect gratitude list
    document.querySelectorAll('.gratitude-list .list-item').forEach(item => {
        data.gratitude.list.push(item.innerText);
    });
    
    // Collect dreams
    document.querySelectorAll('.dream-slip').forEach(dream => {
        data.dreams.dreams.push(dream.innerText);
    });
    
    // Collect memory photos with captions
    document.querySelectorAll('.memory-photo-slot').forEach(slot => {
        const img = slot.querySelector('img');
        const caption = slot.querySelector('.photo-caption');
        data.memories.photos = data.memories.photos || [];
        data.memories.photos.push({
            image: img ? img.src : null,
            caption: caption ? caption.innerText : ''
        });
    });
    
    return data;
}

// ============================================
// LOAD SAVED DATA (DATE-BASED)
// ============================================
function loadDateEntry(dateStr) {
    currentDate = dateStr;
    document.getElementById('journalDate').value = currentDate;
    setCurrentDate();
    
    try {
        const savedData = localStorage.getItem(`journal_${dateStr}`);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            restoreData(data);
            showToast(`Loaded entry for ${formatDateDisplay(dateStr)} 📖`);
        } else {
            // Clear the content for a new day entry
            clearContentForNewDay();
            showToast(`New entry for ${formatDateDisplay(dateStr)} ✨`);
        }
        
        // Update entries list
        populateEntriesList();
        
    } catch (error) {
        console.error('Error loading:', error);
    }
}

function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function clearContentForNewDay() {
    // Clear letter content for new day
    const letterBody = document.querySelector('.letter-body');
    if (letterBody) {
        letterBody.innerText = 'Dear Journal,\n\nToday...';
    }
    
    const continuedWriting = document.querySelector('.continued-writing');
    if (continuedWriting) {
        continuedWriting.innerText = '';
    }
    
    // Clear free writing
    const freeWriting = document.querySelector('.free-writing');
    if (freeWriting) {
        freeWriting.innerText = 'Write your thoughts here...';
    }
    
    // Reset gratitude cards to defaults
    const gratitudeCards = document.querySelectorAll('.gratitude-card .card-text');
    gratitudeCards.forEach((card, index) => {
        const defaults = ['Morning coffee ☕', 'A good book 📚', 'Sunshine 🌞'];
        card.innerText = defaults[index] || 'I\'m grateful for...';
    });
    
    // Reset dreams
    const dreamSlips = document.querySelectorAll('.dream-slip');
    dreamSlips.forEach((slip, index) => {
        const defaults = ['Travel somewhere new ✈️', 'Learn a new skill 🎨'];
        slip.innerText = defaults[index] || 'A dream...';
    });
}

function loadSavedData() {
    // Legacy function - now redirects to date-based loading
    loadDateEntry(currentDate);
}

function restoreData(data) {
    // Helper function
    const setContent = (selector, content) => {
        const el = document.querySelector(selector);
        if (el && content) el.innerText = content;
    };
    
    // Cover
    if (data.cover) {
        setContent('.journal-title', data.cover.title);
        setContent('.journal-subtitle', data.cover.subtitle);
        setContent('.owner-name', data.cover.owner);
    }
    
    // Dedication
    setContent('.dedication-text', data.dedication);
    setContent('.dedication-date', data.dedicationDate);
    
    // Letter
    if (data.letter) {
        setContent('.letter-date', data.letter.date);
        setContent('.letter-greeting', data.letter.greeting);
        setContent('.letter-body', data.letter.body);
    }
    setContent('.continued-writing', data.continued);
    setContent('.sticky-note', data.stickyNote);
    
    // Gratitude
    if (data.gratitude) {
        setContent('#page3 .section-title', data.gratitude.title);
        setContent('.section-subtitle', data.gratitude.subtitle);
        setContent('.quote-box p', data.gratitude.quote);
        
        const cards = document.querySelectorAll('.gratitude-card .card-text');
        data.gratitude.cards.forEach((text, i) => {
            if (cards[i]) cards[i].innerText = text;
        });
        
        const listItems = document.querySelectorAll('.gratitude-list .list-item');
        data.gratitude.list.forEach((text, i) => {
            if (listItems[i]) listItems[i].innerText = text;
        });
    }
    
    // Dreams
    if (data.dreams) {
        setContent('#page4 .section-title', data.dreams.title);
        setContent('.goals-title', data.dreams.goalsTitle);
        
        const dreamSlips = document.querySelectorAll('.dream-slip');
        data.dreams.dreams.forEach((text, i) => {
            if (dreamSlips[i]) dreamSlips[i].innerText = text;
        });
    }
    
    // Memories
    if (data.memories) {
        setContent('#page5 .section-title', data.memories.title);
        setContent('.memory-text', data.memories.memoryText);
        setContent('.memory-date', data.memories.memoryDate);
        
        // Restore memory photos
        if (data.memories.photos) {
            const memorySlots = document.querySelectorAll('.memory-photo-slot');
            data.memories.photos.forEach((photo, i) => {
                if (memorySlots[i] && photo && photo.image) {
                    restoreMemoryPhoto(memorySlots[i], photo.image, photo.caption);
                }
            });
        }
    }
    
    // Notes
    if (data.notes) {
        setContent('#page6 .section-title', data.notes.title);
        setContent('.free-writing', data.notes.content);
    }
    
    // Back cover
    if (data.backCover) {
        setContent('.closing-quote', data.backCover.quote);
    }
}

// Helper function to restore images to slots
function restoreImageToSlot(slot, imgSrc, type) {
    const img = document.createElement('img');
    img.src = imgSrc;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-img';
    deleteBtn.innerHTML = '✕';
    
    if (type === 'dream') {
        deleteBtn.onclick = function(ev) {
            ev.stopPropagation();
            slot.classList.remove('has-image');
            slot.innerHTML = `
                <span class="upload-icon">📷</span>
                <span class="upload-text">Add Photo</span>
                <input type="file" accept="image/*" onchange="handleDreamImageUpload(event, this.parentElement)" hidden>
            `;
            autoSave();
        };
    } else {
        deleteBtn.onclick = function(ev) {
            ev.stopPropagation();
            slot.classList.remove('has-image');
            slot.innerHTML = `
                <input type="file" accept="image/*" onchange="handleVisionImageUpload(event, this.parentElement)" hidden>
                <span class="vision-placeholder">📌 Add Image</span>
            `;
            autoSave();
        };
    }
    
    slot.innerHTML = '';
    slot.appendChild(img);
    slot.appendChild(deleteBtn);
    
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.accept = 'image/*';
    newInput.hidden = true;
    newInput.onchange = type === 'dream' 
        ? function(ev) { handleDreamImageUpload(ev, slot); }
        : function(ev) { handleVisionImageUpload(ev, slot); };
    slot.appendChild(newInput);
    
    slot.classList.add('has-image');
}

// Helper function to restore memory photos with captions
function restoreMemoryPhoto(slot, imgSrc, captionText) {
    const img = document.createElement('img');
    img.src = imgSrc;
    
    const caption = document.createElement('div');
    caption.className = 'photo-caption';
    caption.contentEditable = true;
    caption.textContent = captionText || 'Add caption...';
    caption.onclick = function(ev) { ev.stopPropagation(); };
    caption.onblur = autoSave;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-img';
    deleteBtn.innerHTML = '✕';
    deleteBtn.onclick = function(ev) {
        ev.stopPropagation();
        slot.classList.remove('has-image');
        slot.innerHTML = `
            <input type="file" accept="image/*" onchange="handleMemoryImageUpload(event, this.parentElement)" hidden>
            <span class="photo-placeholder">📷<br>Add Memory</span>
        `;
        autoSave();
    };
    
    slot.innerHTML = '';
    slot.appendChild(img);
    slot.appendChild(caption);
    slot.appendChild(deleteBtn);
    
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.accept = 'image/*';
    newInput.hidden = true;
    newInput.onchange = function(ev) { handleMemoryImageUpload(ev, slot); };
    slot.appendChild(newInput);
    
    slot.classList.add('has-image');
}

// ============================================
// AUTO-SAVE
// ============================================
let autoSaveTimeout;

function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveCurrentEntry();
    }, 1500);
}

// ============================================
// THEME TOGGLE
// ============================================
const themes = ['light', 'dark', 'sepia'];
let currentTheme = 'light';

function toggleTheme() {
    const index = themes.indexOf(currentTheme);
    currentTheme = themes[(index + 1) % themes.length];
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('flipJournalTheme', currentTheme);
    
    const names = {
        'light': 'Classic ☀️',
        'dark': 'Night 🌙',
        'sepia': 'Vintage 📜'
    };
    
    showToast(`Theme: ${names[currentTheme]}`);
}

function loadTheme() {
    const saved = localStorage.getItem('flipJournalTheme');
    if (saved && themes.includes(saved)) {
        currentTheme = saved;
        document.documentElement.setAttribute('data-theme', currentTheme);
    }
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');
    
    if (!toast) return;
    
    if (messageEl) messageEl.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ============================================
// SOUND EFFECT (Optional)
// ============================================
function playFlipSound() {
    // You can add a page flip sound here if desired
    // const audio = new Audio('flip.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(() => {});
}

// ============================================
// TOUCH SUPPORT
// ============================================
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next page
            nextPage();
        } else {
            // Swipe right - previous page
            prevPage();
        }
    }
}

// ============================================
// JSONBIN.IO CLOUD BACKUP CONFIGURATION
// ============================================
// Configuration is loaded from server (which reads from .env file)
// No API keys in client-side code!
let JSONBIN_API_KEY = '';
let JSONBIN_BIN_ID = localStorage.getItem('jsonbin_bin_id') || '';

// Load config from server on startup
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            JSONBIN_API_KEY = config.JSONBIN_API_KEY || '';
            if (config.JSONBIN_BIN_ID && !JSONBIN_BIN_ID) {
                JSONBIN_BIN_ID = config.JSONBIN_BIN_ID;
            }
            console.log('✅ Config loaded from server');
        }
    } catch (error) {
        console.log('⚠️ Could not load config from server (using localStorage only)');
    }
}

// Initialize config on page load
loadConfig();

// ============================================
// BACKUP & RESTORE FUNCTIONS
// ============================================

// Get all journal entries from localStorage
function getAllJournalData() {
    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('journal_') || key.startsWith('flipJournal')) {
            try {
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch (e) {
                allData[key] = localStorage.getItem(key);
            }
        }
    }
    return allData;
}

// Restore all journal entries to localStorage
function restoreAllJournalData(data) {
    for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('journal_') || key.startsWith('flipJournal')) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
    }
}

// Backup to JSONBin.io cloud (primary) and local server (fallback)
async function backupToServer(showNotification = false) {
    const allData = getAllJournalData();
    
    // Try JSONBin.io cloud backup first
    if (JSONBIN_API_KEY && !JSONBIN_API_KEY.includes('YOUR_API_KEY_HERE')) {
        try {
            await backupToJsonBin(allData);
            console.log('✅ Cloud backup to JSONBin.io successful');
        } catch (error) {
            console.log('⚠️ JSONBin.io backup failed:', error.message);
        }
    }
    
    // Also try local server backup as fallback
    try {
        const response = await fetch('/api/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allData)
        });
        
        const result = await response.json();
        
        if (result.success && showNotification) {
            showToast('Backup saved! 💾');
        }
    } catch (error) {
        // Silently fail - server might not be running
        console.log('Local server backup skipped (server not available)');
    }
}

// Backup to JSONBin.io
async function backupToJsonBin(data) {
    const headers = {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
    };
    
    if (JSONBIN_BIN_ID) {
        // Update existing bin
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update JSONBin');
        }
    } else {
        // Create new bin
        headers['X-Bin-Name'] = 'handwritten-journal-backup';
        headers['X-Bin-Private'] = 'true';
        
        const response = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create JSONBin');
        }
        
        const result = await response.json();
        JSONBIN_BIN_ID = result.metadata.id;
        localStorage.setItem('jsonbin_bin_id', JSONBIN_BIN_ID);
        console.log('📦 Created new JSONBin with ID:', JSONBIN_BIN_ID);
    }
}

// Restore from JSONBin.io cloud
async function restoreFromCloud() {
    if (!JSONBIN_API_KEY || JSONBIN_API_KEY.includes('YOUR_API_KEY_HERE')) {
        showToast('Please configure your JSONBin API key first! ⚠️');
        return;
    }
    
    if (!JSONBIN_BIN_ID) {
        showToast('No cloud backup found. Save first! ⚠️');
        return;
    }
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!response.ok) {
            showToast('Failed to load cloud backup ⚠️');
            return;
        }
        
        const result = await response.json();
        restoreAllJournalData(result.record);
        loadDateEntry(currentDate);
        populateEntriesList();
        showToast('Restored from cloud! ☁️✨');
    } catch (error) {
        showToast('Cloud restore failed ⚠️');
        console.error('Cloud restore error:', error);
    }
}

// Restore from local server
async function restoreFromServer() {
    try {
        const response = await fetch('/api/backup');
        
        if (!response.ok) {
            showToast('No local backup found ⚠️');
            return;
        }
        
        const data = await response.json();
        
        if (data.success === false) {
            showToast('No local backup found ⚠️');
            return;
        }
        
        restoreAllJournalData(data);
        loadDateEntry(currentDate);
        populateEntriesList();
        showToast('Restored from local backup! ✨');
    } catch (error) {
        showToast('Local server not available ⚠️');
        console.error('Restore error:', error);
    }
}

// Download backup as JSON file
function downloadBackup() {
    const allData = getAllJournalData();
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-backup-${currentDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Backup downloaded! 📥');
}

// Upload backup from JSON file
function uploadBackupFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            restoreAllJournalData(data);
            loadDateEntry(currentDate);
            populateEntriesList();
            showToast('Backup restored from file! ✨');
        } catch (error) {
            showToast('Invalid backup file ❌');
            console.error('Upload error:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be uploaded again
    event.target.value = '';
}

// ============================================
// CONSOLE MESSAGE
// ============================================
console.log('📖 Flip Journal loaded!');
console.log('💡 Navigation: Arrow keys, Space, or click pages');
console.log('💾 Auto-saves as you write');
console.log('☁️ Cloud backup via JSONBin.io (configure API key in app.js)');
