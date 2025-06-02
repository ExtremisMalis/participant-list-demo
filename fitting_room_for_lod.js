window.__changed = {
    bg: false,
    icon: false,
    plaqueText: false,
    plaqueColor: false,
    avatar: false,
    username: false
};

window.initialState = {};
window.initialUserSettings = {};

function decodeHtml(html) {
    if (!html) return '';
    const safeHtml = html.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "'");
    const txt = document.createElement('textarea');
    txt.innerHTML = safeHtml;
    return txt.value;
}

function extractIconFromHtml(html) {
    if (!html) return '';
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.querySelector('charicon img')?.src || '';
    } catch (e) {
        console.error('Error parsing icon HTML:', e);
        return '';
    }
}

function extractPlaqueFromHtml(html) {
    if (!html) return null;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.querySelector('.plaque');
}

function extractPlaqueTexts(plaque) {
    if (!plaque) return ['', ''];
    const pTags = plaque.querySelectorAll('p');
    return [
        pTags[0]?.textContent || '',
        pTags[1]?.textContent || ''
    ];
}

function extractPlaqueColor(plaque) {
    if (!plaque) return '#FFF';
    const style = plaque.getAttribute('style') || '';
    const colorMatch = style.match(/color:\s*(#[0-9A-F]{6})/i);
    return colorMatch ? colorMatch[1] : '#FFF';
}

document.addEventListener('DOMContentLoaded', function () {
    const userBg = typeof UserFld3 !== 'undefined' ? decodeHtml(UserFld3).match(/src=['"]([^'"]+)['"]/)?.[1] : '';
    const userIcon = typeof UserFld2 !== 'undefined' ? extractIconFromHtml(decodeHtml(UserFld2)) : '';
    const userPlaque = document.querySelector('.fitting-room .plaque');

    window.userInitialColor = userPlaque ? extractPlaqueColor(userPlaque) : '#FFF';
    window.initialUserSettings = {
        bg: userBg,
        icon: userIcon,
        plaqueHTML: userPlaque ? userPlaque.outerHTML : '',
        plaqueTexts: userPlaque ? extractPlaqueTexts(userPlaque) : ['', '']
    };

    saveInitialState();

    initAvatar();
    initUsername();
    initPlaque();
    initBackgrounds();
    initIcons();
    initButtons();
    initManualInputs();
    initUserIcon();

    if (window.initialUserSettings.icon) {
        let targetIcon = document.querySelector('charicon img');
        if (!targetIcon) {
            const charicon = document.querySelector('charicon') || document.createElement('charicon');
            document.body.appendChild(charicon);
            charicon.innerHTML = `<img src="${window.initialUserSettings.icon}">`;
            targetIcon = charicon.querySelector('img');
        } else {
            targetIcon.src = window.initialUserSettings.icon;
        }
    }
});

function saveInitialState() {
    const userPlaque = document.querySelector('.pa-fld1 .plaque');
    const plaqueTexts = userPlaque ? Array.from(userPlaque.querySelectorAll('p')).map(p => p.textContent) : ['', ''];
    const plaqueImg = userPlaque?.querySelector('img')?.src || '';

    window.initialState = {
        bg: document.querySelector('.fitting-bg img')?.src || '',
        icon: document.querySelector('charicon img')?.src || '',
        avatar: document.querySelector('.fitting-avatar img')?.src || '',
        username: document.querySelector('.fitting-author a')?.textContent || '',
        plaqueHTML: userPlaque?.outerHTML || '',
        plaqueImg: plaqueImg,
        plaqueTexts: plaqueTexts
    };
}

function initAvatar() {
    const avatarContainers = document.querySelectorAll('.fitting-avatar img');
    const initialAvatar = typeof UserAvatar !== 'undefined' ? UserAvatar : window.initialState.avatar;

    if (initialAvatar) {
        avatarContainers.forEach(img => {
            img.src = initialAvatar;
            img.style.cursor = 'pointer';

            img.addEventListener('click', function (e) {
                e.stopPropagation();
                openAvatarEditor(img);
            });
        });
    }
}

function openAvatarEditor(imgElement) {
    const existingModal = document.querySelector('.edit-modal.avatar-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'edit-modal avatar-modal';
    Object.assign(modal.style, {
        position: 'fixed',
        zIndex: '10000',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 0 15px rgba(0,0,0,0.5)',
        width: '350px'
    });

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Введите URL изображения';
    urlInput.value = imgElement.src;
    Object.assign(urlInput.style, {
        width: '96%',
        marginBottom: '5px',
        padding: '4px',
        background: '#d9e4f5',
        outline: 'none',
        border: 'none',
        font: '400 11px var(--font-main)',
        borderRadius: '5px'
    });

    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '15px'
    });

    const defaultButton = createModalButton('по умолчанию', () => {
        const initialAvatar = typeof UserAvatar !== 'undefined' ? UserAvatar : window.initialState.avatar;
        urlInput.value = initialAvatar;
        imgElement.src = initialAvatar;
        showTempMessage(defaultButton, 'установлено!');
    });

    const applyButton = createModalButton('применить', () => {
        imgElement.src = urlInput.value;
        document.body.removeChild(modal);
    }, '#4379cf33', 'black');

    const cancelButton = createModalButton('отмена', () => {
        document.body.removeChild(modal);
    }, '#4379cf33', 'black');

    buttonContainer.append(defaultButton, applyButton, cancelButton);
    modal.append(urlInput, buttonContainer);
    document.body.appendChild(modal);

    urlInput.focus();
    urlInput.select();

    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function initUsername() {
    const usernameElements = document.querySelectorAll('.fitting-author a');

    if (typeof UserLogin !== 'undefined') {
        usernameElements.forEach(element => {
            const originalHref = element.getAttribute('href') || '#';
            const originalClass = element.getAttribute('class') || '';

            element.textContent = UserLogin;
            element.setAttribute('href', originalHref);
            element.setAttribute('class', originalClass);
        });
    }
}

function initUserIcon() {
    const chariconContainer = document.querySelector('.pa-fld2 charicon');
    
    if (!chariconContainer) return;
    
    const fishIcon = chariconContainer.querySelector('img');
    
    if (window.initialUserSettings.icon) {
        if (fishIcon) {
            fishIcon.src = window.initialUserSettings.icon;
        } 
        else {
            chariconContainer.innerHTML = `<img src="${window.initialUserSettings.icon}">`;
        }
    }
}

function initPlaque() {
    const plaqueElement = document.querySelector('.fitting-plaque .plaque');
    if (!plaqueElement) return;

    const userPlaque = document.querySelector('.pa-fld1 .plaque');

    window.initialUserSettings.plaqueHTML = userPlaque?.outerHTML || '';
    window.initialUserSettings.plaqueImg = userPlaque?.querySelector('img')?.src || '';
    window.initialUserSettings.plaqueTexts = userPlaque
        ? Array.from(userPlaque.querySelectorAll('p')).map(p => p.textContent)
        : ['', ''];

    if (userPlaque) {
        plaqueElement.innerHTML = userPlaque.innerHTML;
    }

    const inputs = document.querySelectorAll('.plaque-input');
    inputs.forEach((input, index) => {
        if (window.initialUserSettings.plaqueTexts[index]) {
            input.value = window.initialUserSettings.plaqueTexts[index];
        }
    });

    const plaqueImagesContainer = document.querySelector('fittingplaque');
    if (plaqueImagesContainer) {
        plaqueImagesContainer.querySelectorAll('img').forEach(img => {
            if (img.src === window.initialUserSettings.plaqueImg) {
                img.classList.add('fit-selected');
            }

            img.addEventListener('click', function () {
                const existingImg = plaqueElement.querySelector('img');
                if (existingImg) existingImg.remove();

                const newImg = document.createElement('img');
                newImg.src = this.src;
                plaqueElement.appendChild(newImg);

                plaqueImagesContainer.querySelectorAll('img').forEach(i => {
                    i.classList.remove('fit-selected');
                });
                this.classList.add('fit-selected');

                window.initialUserSettings.plaqueImg = this.src;
                window.__changed.plaqueImage = true;
            });
        });
    }

    inputs.forEach(input => {
        input.addEventListener('input', function () {
            const pTags = plaqueElement.querySelectorAll('p');
            const index = Array.from(inputs).indexOf(this);
            if (pTags[index]) {
                pTags[index].textContent = this.value;
                window.__changed.plaqueText = true;
            }
        });
    });
}

function initManualInputs() {
    document.querySelector('.fit-icon')?.addEventListener('click', function () {
        const url = document.querySelector('.icon-input').value.trim();
        if (url) {
            const icon = document.querySelector('charicon img');
            if (icon) {
                icon.src = url;
                window.__changed.icon = true;
                showNotification('Иконка обновлена!');
            }
        }
    });

    document.querySelector('.fit-bg')?.addEventListener('click', function () {
        const url = document.querySelector('.bg-input').value.trim();
        if (url) {
            const bg = document.querySelector('.fitting-bg img');
            if (bg) {
                bg.src = url;
                window.__changed.bg = true;
                showNotification('Фон обновлен!');
            }
        }
    });

    document.querySelector('.fit-plaq')?.addEventListener('click', function () {
        const url = document.querySelector('.plaq-input').value.trim();
        if (url) {
            const plaque = document.querySelector('.fitting-plaque .plaque');
            if (plaque) {
                let img = plaque.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    plaque.appendChild(img);
                }
                img.src = url;
                window.__changed.plaqueImage = true;
                window.initialUserSettings.plaqueImg = url;
                showNotification('Изображение плашки обновлено!');
            }
        }
    });

    document.querySelectorAll('.icon-input, .bg-input, .plaq-input').forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const buttonMap = {
                    'icon-input': '.fit-icon',
                    'bg-input': '.fit-bg',
                    'plaq-input': '.fit-plaq'
                };
                document.querySelector(buttonMap[this.classList[0]])?.click();
            }
        });
    });
}

function initBackgrounds() {
    const bgContainer = document.querySelector('fittingbg');
    const targetBg = document.querySelector('.fitting-bg img');

    if (bgContainer && targetBg) {
        if (window.initialUserSettings.bg) {
            targetBg.src = window.initialUserSettings.bg;
        }

        bgContainer.querySelectorAll('img').forEach(bgImg => {
            bgImg.style.cursor = 'pointer';

            if (bgImg.src === targetBg.src) {
                bgImg.classList.add('fit-selected');
            }

            bgImg.addEventListener('click', function () {
                bgContainer.querySelectorAll('img').forEach(img => {
                    img.classList.remove('fit-selected');
                });

                this.classList.add('fit-selected');
                targetBg.src = this.src;
                window.__changed.bg = true;
            });
        });
    }
}

function initIcons() {
    let chariconContainer = document.querySelector('.pa-fld2 charicon');
    
    if (!chariconContainer) {
        const paFld2 = document.querySelector('.pa-fld2');
        if (paFld2) {
            paFld2.innerHTML = `
                <charinfo>
                    <charicon>
                        <img src="${window.initialUserSettings.icon || ''}">
                    </charicon>
                </charinfo>
            `;
            chariconContainer = paFld2.querySelector('charicon');
        }
    }
    
    let targetIcon = chariconContainer?.querySelector('img');
    
    const fittingIconsContainer = document.querySelector('fittingicons');
    if (!fittingIconsContainer || !targetIcon) return;
    
    if (window.initialUserSettings.icon) {
        targetIcon.src = window.initialUserSettings.icon;
    }
    
    fittingIconsContainer.querySelectorAll('img').forEach(icon => {
        icon.style.cursor = 'pointer';
        
        if (icon.src === targetIcon.src) {
            icon.classList.add('fit-selected');
        }
        
        icon.addEventListener('click', function() {
            targetIcon.src = this.src;
            window.__changed.icon = true;
            
            fittingIconsContainer.querySelectorAll('img').forEach(img => {
                img.classList.remove('fit-selected');
            });
            this.classList.add('fit-selected');
        });
    });
}

function initButtons() {
    const copyButton = document.querySelector('.fit-copy');
    if (copyButton) {
        copyButton.addEventListener('click', copyChanges);
    }

    const resetButton = document.querySelector('.fit-cleardata');
    if (resetButton) {
        resetButton.addEventListener('click', resetToInitial);
    }
}

function copyChanges() {
    let fullCode = '';

    const currentBg = document.querySelector('.fitting-bg img')?.src || '';
    const currentIcon = document.querySelector('charicon img')?.src || '';
    const plaque = document.querySelector('.fitting-plaque .plaque');
    const plaqueImg = plaque?.querySelector('img')?.src || '';

    const inputs = document.querySelectorAll('.plaque-input');
    const currentText1 = inputs[0]?.value || '';
    const currentText2 = inputs[1]?.value || '';

    if (currentBg !== (window.initialUserSettings.bg || window.initialState.bg)) {
        fullCode += `бэкграунд профиля\n[code]<img src="${currentBg}">[/code]\n\n`;
    }

    if (currentIcon !== (window.initialUserSettings.icon || window.initialState.icon)) {
        fullCode += `иконка\n[code]<charicon><img src="${currentIcon}"></charicon>[/code]\n\n`;
    }

    const initialTexts = window.initialUserSettings.plaqueTexts || ['', ''];
    const initialImg = window.initialUserSettings.plaqueImg || '';

    const texts = Array.from(plaque?.querySelectorAll('p') || []).map(p => p.textContent);
    const textChanged = texts[0] !== initialTexts[0] || texts[1] !== initialTexts[1];
    const imgChanged = plaqueImg !== initialImg;

    if (textChanged || imgChanged) {
        fullCode += `плашка\n[code]<div class="plaque">
            <p>${texts[0] || ''}</p>
            <p>${texts[1] || ''}</p>
            ${plaqueImg ? `<img src="${plaqueImg}">` : ''}
        </div>[/code]\n\n`;
    }

    if (fullCode.trim()) {
        copyToClipboard(fullCode);
    } else {
        showNotification('Никаких изменений для копирования не найдено!');
    }
}

function resetToInitial() {
    const bgImg = document.querySelector('.fitting-bg img');
    if (bgImg) {
        bgImg.src = window.initialUserSettings.bg || window.initialState.bg;
        window.__changed.bg = false;

        document.querySelectorAll('fittingbg img').forEach(img => {
            img.classList.remove('fit-selected');
            if (img.src === (window.initialUserSettings.bg || window.initialState.bg)) {
                img.classList.add('fit-selected');
            }
        });
    }

    const iconImg = document.querySelector('charicon img');
    if (iconImg) {
        iconImg.src = window.initialUserSettings.icon || window.initialState.icon;
        window.__changed.icon = false;

        document.querySelectorAll('fittingicons img').forEach(img => {
            img.classList.remove('fit-selected');
            if (img.src === (window.initialUserSettings.icon || window.initialState.icon)) {
                img.classList.add('fit-selected');
            }
        });
    }

    const avatarImg = document.querySelector('.fitting-avatar img');
    if (avatarImg) {
        avatarImg.src = typeof UserAvatar !== 'undefined' ? UserAvatar : window.initialState.avatar;
        window.__changed.avatar = false;
    }

    const usernameElements = document.querySelectorAll('.fitting-author a');
    usernameElements.forEach(element => {
        element.textContent = typeof UserLogin !== 'undefined' ? UserLogin : window.initialState.username;
    });

    const plaque = document.querySelector('.fitting-plaque .plaque');
    if (plaque) {
        const initialPlaque = window.initialUserSettings.plaqueHTML
            ? new DOMParser().parseFromString(window.initialUserSettings.plaqueHTML, 'text/html').querySelector('.plaque')
            : null;

        if (initialPlaque) {
            plaque.innerHTML = initialPlaque.innerHTML;
            plaque.setAttribute('style', initialPlaque.getAttribute('style') || '');
        } else {
            const texts = window.initialUserSettings.plaqueTexts || window.initialState.plaqueTexts || ['', ''];
            const pTags = plaque.querySelectorAll('p');
            pTags.forEach((p, index) => {
                if (texts[index]) p.textContent = texts[index];
            });
            plaque.style.color = window.userInitialColor;
        }

        const plaqueImagesContainer = document.querySelector('fittingplaque');
        if (plaqueImagesContainer) {
            const initialImg = window.initialUserSettings.plaqueImg || '';
            plaqueImagesContainer.querySelectorAll('img').forEach(img => {
                img.classList.remove('fit-selected');
                if (img.src === initialImg) {
                    img.classList.add('fit-selected');
                }
            });
        }

        window.__changed.plaqueText = false;
        window.__changed.plaqueColor = false;
        window.__changed.plaqueImage = false;
    }

    document.querySelectorAll('.plaque-input').forEach((input, index) => {
        const texts = window.initialUserSettings.plaqueTexts || window.initialState.plaqueTexts || ['', ''];
        if (input && texts[index]) {
            input.value = texts[index];
        } else {
            input.value = '';
        }
    });

    const colorInput = document.querySelector('.plaque-controls input[type="text"][placeholder^="HEX"]');
    const colorPicker = document.querySelector('.plaque-controls input[type="color"]');
    if (colorInput && colorPicker) {
        const initialColor = window.initialUserSettings.plaqueHTML
            ? extractPlaqueColor(new DOMParser().parseFromString(window.initialUserSettings.plaqueHTML, 'text/html').querySelector('.plaque'))
            : window.userInitialColor;

        colorInput.value = initialColor;
        colorPicker.value = initialColor;
    }

    if (typeof window.updatePlaque === 'function') {
        window.updatePlaque();
    }

    showNotification('Все значения сброшены к изначальным');
}

function createModalButton(text, onClick, bgColor = '#e0e0e0', textColor = 'black') {
    const button = document.createElement('button');
    button.textContent = text;
    Object.assign(button.style, {
        padding: '5px 10px',
        cursor: 'pointer',
        border: 'none',
        font: '400 11px var(--font-main)',
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '5px'
    });
    button.addEventListener('click', function (e) {
        e.stopPropagation();
        onClick();
    });
    return button;
}

function showTempMessage(element, message) {
    const originalText = element.textContent;
    element.textContent = message;
    setTimeout(() => {
        element.textContent = originalText;
    }, 2000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('скопировано!');
    }).catch(err => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('скопировано!');
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px 20px',
        fontFamily: 'Roboto Flex',
        fontSize: '12px',
        borderRadius: '5px',
        zIndex: '10000',
        transition: 'opacity 0.3s',
        opacity: '1'
    });
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}
