// SkyAlps Travel Portal - Professional Minimal Design
(function() {
    'use strict';
    
    // ============================================
    // CONFIGURAZIONE
    // ============================================
    var CONFIG = {
        GOOGLE_FORM: {
            FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSeEQmM8kIO-UVDvO9OUBEv9_8Lcets94kmsdAtjNseHOb10xQ/viewform',
            ENTRY_IDS: {
                DESTINAZIONE: '1962979582',
                ALTRO_DESTINAZIONE: '511423339',
                TIPO_VACANZA: '2110947684',
                DATA_PARTENZA: '147643521',
                DATA_RITORNO: '1693143198',
                NOTTI: '1685578336',
                BUDGET: '1754723474',
                TRATTAMENTO: '1708020949',
                STELLE: '150110489',
                HOTEL: '1702219304',
                SPIAGGIA: '1223850211',
                PISCINA: '1570330943',
                V1_NOME: '627164198',
                V1_COGNOME: '1706212954',
                V1_NASCITA: '238330579',
                V2_NOME: '1883593803',
                V2_COGNOME: '2008653327',
                V2_NASCITA: '523089006',
                V3_NOME: '1234567890',
                V3_COGNOME: '2345678901',
                V3_NASCITA: '3456789012',
                V4_NOME: '4567890123',
                V4_COGNOME: '5678901234',
                V4_NASCITA: '6789012345',
                NUM_BAMBINI: '412831974',
                NUM_NEONATI: '1897425446',
                NOME: '1824028048',
                COGNOME: '137855359',
                NASCITA_INTEST: '1632861476',
                LUOGO_NASCITA: '1573722755',
                CF: '320339597',
                EMAIL: '929797032',
                TELEFONO: '822089197',
                MESSAGGIO: '2001482042',
                PRATICA: '332822326'
            }
        },
        WHATSAPP_NUM: '393358060715',
        STORAGE_KEY: 'skyalps_booking_v2'
    };
    
    // ============================================
    // VARIABILI GLOBALI
    // ============================================
    var currentLang = 'it';
    var children = 0;
    var infants = 0;
    var nights = 7;
    
    var t = {
        it: { 
            sending: 'Invio in corso...', 
            sent: 'Richiesta inviata!', 
            waSent: 'Inviato su WhatsApp',
            googleSent: 'Salvato su Google Sheets',
            error: 'Errore durante l\'invio',
            required: 'Compila tutti i campi obbligatori',
            invalidDate: 'Data non valida'
        },
        de: { 
            sending: 'Wird gesendet...', 
            sent: 'Anfrage gesendet!', 
            waSent: 'Per WhatsApp gesendet',
            googleSent: 'In Google Sheets gespeichert',
            error: 'Fehler beim Senden',
            required: 'Fülle alle Pflichtfelder aus',
            invalidDate: 'Ungültiges Datum'
        }
    };

    // ============================================
    // INIZIALIZZAZIONE
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        initDatePickers();
        initCounters();
        initDestination();
        initFormSubmit();
        initVacationTypes();
        initStarRating();
        loadData();
        initNavigation();
        initPhoneInput();
        updateProgress();
        initGDPRModal();
    });

    // ============================================
    // LOCAL STORAGE
    // ============================================
    function saveData() {
        var form = document.getElementById('bookingForm');
        if (!form) return;
        
        // Prima sincronizza i campi dinamici
        syncDynamicFields();
        
        var data = {};
        var inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function(input) {
            if (input.type === 'radio') {
                if (input.checked) data[input.name] = input.value;
            } else if (input.type === 'checkbox') {
                data[input.name] = input.checked;
            } else {
                data[input.name] = input.value;
            }
        });
        
        data._nights = nights;
        data._children = children;
        data._infants = infants;
        data._secondAdult = !document.getElementById('secondAdultCard').classList.contains('hidden');
        data._thirdAdult = document.getElementById('thirdAdultCard') && !document.getElementById('thirdAdultCard').classList.contains('hidden');
        data._fourthAdult = document.getElementById('fourthAdultCard') && !document.getElementById('fourthAdultCard').classList.contains('hidden');
        data._lang = currentLang;
        var sendMethod = document.querySelector('[name="sendMethod"]:checked');
        if (sendMethod) data._sendMethod = sendMethod.value;
        
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    }

    function loadData() {
        var saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!saved) return;
        
        try {
            var data = JSON.parse(saved);
            
            Object.keys(data).forEach(function(key) {
                if (key.startsWith('_')) return;
                
                var input = document.querySelector('[name="' + key + '"]');
                if (!input) return;
                
                if (input.type === 'radio') {
                    var radio = document.querySelector('[name="' + key + '"][value="' + data[key] + '"]');
                    if (radio) radio.checked = true;
                } else if (input.type === 'checkbox') {
                    input.checked = data[key];
                } else {
                    input.value = data[key];
                }
            });
            
            if (data._nights) {
                nights = parseInt(data._nights);
                document.getElementById('nights').textContent = nights;
                document.querySelector('[name="entry.NOTTI"]').value = nights;
            }
            
            if (data._children) {
                children = parseInt(data._children);
                document.getElementById('children').textContent = children;
                updateChildrenFields();
            }
            
            if (data._infants) {
                infants = parseInt(data._infants);
                document.getElementById('infants').textContent = infants;
                updateInfantsFields();
            }
            
            if (data._secondAdult) {
                document.getElementById('secondAdultCard').classList.remove('hidden');
                document.getElementById('secondAdultCard').classList.add('expanded');
                document.getElementById('addAdult').classList.add('hidden');
                // Rendi obbligatori i campi del secondo adulto
                document.getElementById('secondAdultCard').querySelectorAll('input').forEach(function(input) {
                    input.setAttribute('required', 'required');
                });
            }
            
            if (data._thirdAdult) {
                document.getElementById('thirdAdultCard').classList.remove('hidden');
                document.getElementById('thirdAdultCard').classList.add('expanded');
                // Rendi obbligatori i campi del terzo adulto
                document.getElementById('thirdAdultCard').querySelectorAll('input').forEach(function(input) {
                    input.setAttribute('required', 'required');
                });
            }
            
            if (data._fourthAdult) {
                document.getElementById('fourthAdultCard').classList.remove('hidden');
                document.getElementById('fourthAdultCard').classList.add('expanded');
                // Rendi obbligatori i campi del quarto adulto
                document.getElementById('fourthAdultCard').querySelectorAll('input').forEach(function(input) {
                    input.setAttribute('required', 'required');
                });
            }
            
            if (data._sendMethod) {
                var sendMethodInput = document.querySelector('[name="sendMethod"][value="' + data._sendMethod + '"]');
                if (sendMethodInput) sendMethodInput.checked = true;
            }
            
            if (data._lang) setLang(data._lang);
            
            restoreChildrenData(data);
            updateSummary();
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }

    function restoreChildrenData(data) {
        // Restore bambini da JSON (supporta sia formato nuovo che vecchio)
        var bambiniStr = data['entry.NUM_BAMBINI'];
        if (bambiniStr && bambiniStr.startsWith('[')) {
            try {
                var bambiniData = JSON.parse(bambiniStr);
                for (var i = 0; i < bambiniData.length; i++) {
                    var container = document.getElementById('childrenFields');
                    if (container && container.children[i]) {
                        var row = container.children[i];
                        var inputs = row.querySelectorAll('input');
                        // Supporta formato compatto (n, c, d) e formato esteso (nome, cognome, nascita)
                        var nome = bambiniData[i].n || bambiniData[i].nome || '';
                        var cognome = bambiniData[i].c || bambiniData[i].cognome || '';
                        var nascita = bambiniData[i].d || bambiniData[i].nascita || '';
                        if (inputs.length >= 2) {
                            if (nome) inputs[0].value = nome;
                            if (cognome) inputs[1].value = cognome;
                        }
                        // Cerca e imposta la data di nascita
                        var nascitaInput = row.querySelector('input[name^="entry.B"]');
                        if (nascitaInput && nascita) nascitaInput.value = nascita;
                    }
                }
            } catch (e) {
                console.error('Error parsing bambini data:', e);
            }
        }
        
        // Restore neonati da JSON (supporta sia formato nuovo che vecchio)
        var neonatiStr = data['entry.NUM_NEONATI'];
        if (neonatiStr && neonatiStr.startsWith('[')) {
            try {
                var neonatiData = JSON.parse(neonatiStr);
                for (var j = 0; j < neonatiData.length; j++) {
                    var container = document.getElementById('infantsFields');
                    if (container && container.children[j]) {
                        var row = container.children[j];
                        var inputs = row.querySelectorAll('input');
                        // Supporta formato compatto (n, c, d) e formato esteso (nome, cognome, nascita)
                        var nome = neonatiData[j].n || neonatiData[j].nome || '';
                        var cognome = neonatiData[j].c || neonatiData[j].cognome || '';
                        var nascita = neonatiData[j].d || neonatiData[j].nascita || '';
                        if (inputs.length >= 2) {
                            if (nome) inputs[0].value = nome;
                            if (cognome) inputs[1].value = cognome;
                        }
                        var nascitaInput = row.querySelector('input[name^="entry.N"]');
                        if (nascitaInput && nascita) nascitaInput.value = nascita;
                    }
                }
            } catch (e) {
                console.error('Error parsing neonati data:', e);
            }
        }
    }

    function clearData() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }

    // ============================================
    // LINGUA
    // ============================================
    window.setLang = function(lang) {
        currentLang = lang;
        document.querySelectorAll('.lang-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        document.querySelectorAll('[data-it][data-de]').forEach(function(el) {
            el.textContent = lang === 'it' ? el.dataset.it : el.dataset.de;
        });
        
        // Traduci anche i placeholder
        document.querySelectorAll('[data-it-placeholder][data-de-placeholder]').forEach(function(el) {
            el.placeholder = lang === 'it' ? el.dataset.itPlaceholder : el.dataset.dePlaceholder;
        });
        
        if (typeof flatpickr !== 'undefined') {
            document.querySelectorAll('.flatpickr-input').forEach(function(el) {
                if (el._flatpickr) el._flatpickr.set('locale', lang);
            });
        }
        
        saveData();
    };

    // ============================================
    // DATE PICKERS
    // ============================================
    function initDatePickers() {
        if (typeof flatpickr === 'undefined') return;
        
        var today = new Date();
        var mayThisYear = new Date(today.getFullYear(), 4, 1); // May 1st
        var startDate = (today.getMonth() >= 4) ? mayThisYear : new Date(today.getFullYear(), 4, 1);
        var nextYear = new Date(today);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        flatpickr('#departureDate', {
            minDate: startDate,
            maxDate: nextYear,
            dateFormat: 'd/m/Y',
            locale: currentLang,
            onChange: function(selectedDates) {
                if (selectedDates.length > 0) updateReturnDate(selectedDates[0]);
                saveData();
            }
        });
        
        flatpickr('#returnDate', {
            minDate: today,
            maxDate: nextYear,
            dateFormat: 'd/m/Y',
            locale: currentLang,
            onChange: function() {
                calculateNights();
                saveData();
            }
        });
        
        document.querySelectorAll('.date-input').forEach(function(input) {
            flatpickr(input, {
                minDate: new Date().getFullYear() - 100,
                maxDate: 'today',
                dateFormat: 'd/m/Y',
                locale: currentLang,
                onChange: saveData
            });
        });
    }

    function updateReturnDate(departureDate) {
        if (typeof flatpickr === 'undefined') return;
        var returnPicker = flatpickr('#returnDate');
        if (returnPicker && departureDate) {
            var rd = new Date(departureDate);
            rd.setDate(rd.getDate() + nights);
            returnPicker.setDate(rd);
        }
    }

    function calculateNights() {
        var depPicker = flatpickr('#departureDate');
        var retPicker = flatpickr('#returnDate');
        if (depPicker && retPicker && depPicker.selectedDates.length > 0 && retPicker.selectedDates.length > 0) {
            var dep = depPicker.selectedDates[0];
            var ret = retPicker.selectedDates[0];
            var diffTime = Math.abs(ret - dep);
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 0 && diffDays <= 60) {
                nights = diffDays;
                document.getElementById('nights').textContent = nights;
                document.querySelector('[name="entry.NOTTI"]').value = nights;
                saveData();
            }
        }
    }

    // ============================================
    // COUNTERS
    // ============================================
    function initCounters() {
        // Notti
        document.querySelectorAll('.nights-counter .cnt-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (this.classList.contains('minus') && nights > 1) nights--;
                else if (this.classList.contains('plus') && nights < 30) nights++;
                
                document.getElementById('nights').textContent = nights;
                document.querySelector('[name="entry.NOTTI"]').value = nights;
                
                saveData();
                
                if (typeof flatpickr !== 'undefined') {
                    var dp = flatpickr('#departureDate');
                    if (dp && dp.selectedDates.length > 0) updateReturnDate(dp.selectedDates[0]);
                }
            });
        });

        // Bambini
        document.getElementById('childMinus').addEventListener('click', function() {
            if (children > 0) { children--; updateChildrenFields(); saveData(); }
        });
        document.getElementById('childPlus').addEventListener('click', function() {
            if (children < 6) { children++; updateChildrenFields(); saveData(); }
        });

        // Neonati
        document.getElementById('infantMinus').addEventListener('click', function() {
            if (infants > 0) { infants--; updateInfantsFields(); saveData(); }
        });
        document.getElementById('infantPlus').addEventListener('click', function() {
            if (infants < 3) { infants++; updateInfantsFields(); saveData(); }
        });

        // Budget slider
        var budgetSlider = document.getElementById('budget');
        if (budgetSlider) {
            budgetSlider.addEventListener('input', function() {
                document.getElementById('budgetVal').textContent = Number(this.value).toLocaleString('it-IT');
                saveData();
            });
        }
    }

    function updateChildrenFields() {
        document.getElementById('children').textContent = children;
        var container = document.getElementById('childrenFields');
        if (!container) return;
        
        var existing = container.children.length;
        if (children > existing) {
            for (var i = existing; i < children; i++) {
                var div = document.createElement('div');
                div.className = 'compact-traveler-row';
                div.innerHTML = 
                    '<div class="compact-row-fields">' +
                    '<input type="text" name="entry.B' + (i + 1) + '_NOME" placeholder="Nome *" required>' +
                    '<input type="text" name="entry.B' + (i + 1) + '_COGNOME" placeholder="Cognome *" required>' +
                    '</div>' +
                    '<input type="text" class="date-input child-birthdate" name="entry.B' + (i + 1) + '_NASCITA" placeholder="Data di nascita * (gg/mm/aaaa)" required>';
                container.appendChild(div);
                
                if (typeof flatpickr !== 'undefined') {
                    flatpickr(div.querySelector('.child-birthdate'), {
                        minDate: new Date(new Date().getFullYear() - 12, 0, 1),
                        maxDate: new Date(new Date().getFullYear() - 2, 11, 31),
                        dateFormat: 'd/m/Y',
                        locale: currentLang,
                        onChange: saveData
                    });
                }
            }
        } else {
            while (container.children.length > children) container.lastChild.remove();
        }
    }

    function updateInfantsFields() {
        document.getElementById('infants').textContent = infants;
        var container = document.getElementById('infantsFields');
        if (!container) return;
        
        var existing = container.children.length;
        if (infants > existing) {
            for (var i = existing; i < infants; i++) {
                var div = document.createElement('div');
                div.className = 'compact-traveler-row';
                div.innerHTML = 
                    '<div class="compact-row-fields">' +
                    '<input type="text" name="entry.N' + (i + 1) + '_NOME" placeholder="Nome *" required>' +
                    '<input type="text" name="entry.N' + (i + 1) + '_COGNOME" placeholder="Cognome *" required>' +
                    '</div>' +
                    '<input type="text" class="date-input infant-birthdate" name="entry.N' + (i + 1) + '_NASCITA" placeholder="Data di nascita * (gg/mm/aaaa)" required>';
                container.appendChild(div);
                
                if (typeof flatpickr !== 'undefined') {
                    flatpickr(div.querySelector('.infant-birthdate'), {
                        minDate: new Date(new Date().getFullYear() - 2, 0, 1),
                        maxDate: 'today',
                        dateFormat: 'd/m/Y',
                        locale: currentLang,
                        onChange: saveData
                    });
                }
            }
        } else {
            while (container.children.length > infants) container.lastChild.remove();
        }
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function initNavigation() {
        document.querySelectorAll('.btn-next').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var step = parseInt(this.dataset.next);
                var currentStep = step - 1;
                
                if (validate(currentStep)) {
                    saveData();
                    goToStep(step);
                } else {
                    showError(t[currentLang].required);
                }
            });
        });

        document.querySelectorAll('.btn-prev').forEach(function(btn) {
            btn.addEventListener('click', function() {
                goToStep(parseInt(this.dataset.prev));
            });
        });
        
        // ============================================
        // ADD/REMOVE ADULTS (up to 4)
        // ============================================
        // Aggiorna adultCount in base ai dati salvati (dopo loadData)
        var adultCount = 1;
        var adultCards = ['secondAdultCard', 'thirdAdultCard', 'fourthAdultCard'];
        
        adultCards.forEach(function(cardId) {
            var cardEl = document.getElementById(cardId);
            if (cardEl && !cardEl.classList.contains('hidden')) {
                adultCount++;
            }
        });
        
        // Assicurati che il pulsante sia visibile se non siamo al massimo
        var addBtn = document.getElementById('addAdult');
        if (addBtn) {
            if (adultCount >= 4) {
                addBtn.style.display = 'none';
            } else {
                addBtn.style.display = 'inline-flex';
            }
        }
        
        document.getElementById('addAdult').addEventListener('click', function() {
            if (adultCount < 4) {
                var nextCard = adultCards[adultCount - 1];
                var cardEl = document.getElementById(nextCard);
                if (cardEl) {
                    cardEl.classList.remove('hidden');
                    cardEl.classList.add('expanded');
                    adultCount++;
                    
                    // Rendi obbligatori i campi del nuovo adulto
                    cardEl.querySelectorAll('input').forEach(function(input) {
                        input.setAttribute('required', 'required');
                    });
                    
                    // Hide add button if max reached
                    if (adultCount >= 4) {
                        this.style.display = 'none';
                    }
                    saveData();
                }
            }
        });
        
        // Remove adult handlers
        ['removeAdult', 'removeAdult3', 'removeAdult4'].forEach(function(id, index) {
            var btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function() {
                    var cardId = adultCards[index];
                    var cardEl = document.getElementById(cardId);
                    if (cardEl) {
                        cardEl.classList.add('hidden');
                        cardEl.classList.remove('expanded');
                        // Rendi non obbligatori i campi prima di pulirli
                        cardEl.querySelectorAll('input').forEach(function(input) {
                            input.removeAttribute('required');
                            input.value = '';
                        });
                    }
                    adultCount--;
                    document.getElementById('addAdult').style.display = 'inline-flex';
                    saveData();
                });
            }
        });
    }

    function goToStep(step) {
        document.querySelectorAll('.step').forEach(function(s) { s.classList.remove('active'); });
        document.querySelectorAll('.prog-step').forEach(function(s, i) {
            s.classList.remove('active', 'completed');
            if (i + 1 < step) s.classList.add('completed');
            else if (i + 1 === step) s.classList.add('active');
        });
        
        var activeStep = document.querySelector('.step[data-step="' + step + '"]');
        if (activeStep) activeStep.classList.add('active');
        
        updateProgress();
        if (step === 5) updateSummary();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateProgress() {
        var activeStep = document.querySelector('.prog-step.active');
        if (!activeStep) return;
        var step = parseInt(activeStep.dataset.step);
        var percentage = (step / 5) * 100;
        document.getElementById('progressFill').style.width = percentage + '%';
    }

    function validate(step) {
        var ok = true;
        var currentStepEl = document.querySelector('.step[data-step="' + step + '"]');
        if (!currentStepEl) return true;
        
        currentStepEl.querySelectorAll('[required]').forEach(function(input) {
            var value = input.value.trim();
            var inputName = input.name || input.id;
            
            if (input.type === 'radio') {
                var name = input.name;
                var checked = currentStepEl.querySelector('[name="' + name + '"]:checked');
                if (!checked) ok = false;
            } else if (!value) {
                ok = false;
                setFieldError(input, true);
            } else {
                // Advanced validation
                var isValid = true;
                
                // Phone validation (Italian format: +39 or 3xx for mobile, at least 10 digits)
                if (inputName === 'TELEFONO' || input.id === 'telefono') {
                    var phoneClean = value.replace(/[\s\-\.]/g, '');
                    if (!/^[+]?[0-9]{10,15}$/.test(phoneClean)) {
                        isValid = false;
                    }
                }
                
                // Date of birth validation (DD/MM/YYYY format)
                if (inputName === 'DATANASCITA' || input.id === 'datanascita') {
                    var dateParts = value.split('/');
                    if (dateParts.length !== 3) {
                        isValid = false;
                    } else {
                        var day = parseInt(dateParts[0], 10);
                        var month = parseInt(dateParts[1], 10);
                        var year = parseInt(dateParts[2], 10);
                        
                        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
                            isValid = false;
                        } else {
                            var date = new Date(year, month - 1, day);
                            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                                isValid = false;
                            }
                        }
                    }
                }
                
                // Italian Fiscal Code validation (16 characters, alphanumeric)
                if (inputName === 'CODICEFISCALE' || input.id === 'codicefiscale') {
                    var cfClean = value.toUpperCase().replace(/\s/g, '');
                    if (cfClean.length !== 16) {
                        isValid = false;
                    } else if (!/^[A-Z0-9]{16}$/.test(cfClean)) {
                        isValid = false;
                    }
                }
                
                // Email validation
                if (input.type === 'email' || inputName === 'EMAIL' || input.id === 'email') {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        isValid = false;
                    }
                }
                
                if (!isValid) {
                    ok = false;
                    setFieldError(input, true);
                } else {
                    setFieldError(input, false);
                }
            }
        });
        return ok;
    }
    
    function setFieldError(input, hasError) {
        input.style.borderColor = hasError ? '#ef4444' : '#10b981';
        if (hasError) {
            input.classList.add('error');
            input.classList.remove('valid');
        } else {
            input.classList.add('valid');
            input.classList.remove('error');
        }
        
        // Remove error styling on input
        if (hasError) {
            input.addEventListener('input', function() {
                this.style.borderColor = '';
                this.classList.remove('error', 'valid');
            }, { once: true });
        }
    }

    // ============================================
    // DESTINATION
    // ============================================
    function initDestination() {
        var destSelect = document.getElementById('destination');
        if (!destSelect) return;
        
        destSelect.addEventListener('change', function() {
            var otherGroup = document.getElementById('otherDestGroup');
            var otherInput = document.getElementById('otherDest');
            
            if (this.value === 'ALTRO') {
                otherGroup.classList.remove('hidden');
                if (otherInput) otherInput.required = true;
            } else {
                otherGroup.classList.add('hidden');
                if (otherInput) {
                    otherInput.required = false;
                    otherInput.value = '';
                }
            }
            saveData();
        });
    }

    // ============================================
    // VACATION TYPES
    // ============================================
    function initVacationTypes() {
        document.querySelectorAll('.vacation-option input').forEach(function(input) {
            input.addEventListener('change', saveData);
        });
    }

    // ============================================
    // STAR RATING
    // ============================================
    function initStarRating() {
        document.querySelectorAll('.star-option input').forEach(function(input) {
            input.addEventListener('change', saveData);
        });
    }

    // ============================================
    // SUMMARY
    // ============================================
    function updateSummary() {
        var form = document.getElementById('bookingForm');
        var formData = new FormData(form);
        var d = {};
        formData.forEach(function(value, key) {
            d[key] = value;
        });
        
        var dest = d['entry.DESTINAZIONE'] || '';
        if (dest === 'ALTRO') dest = d['entry.ALTRO_DESTINAZIONE'] || 'Altra destinazione';
        
        var destMap = {
            'CATANIA_SICILIA': 'Catania - Sicilia',
            'LAMEZIA_CALABRIA': 'Lamezia Terme - Calabria',
            'SALONICCO_GRECIA': 'Salonicco/Halkidiki - Grecia',
            'PARVALIA_GRECIA': 'Preveza/Lefkada - Grecia',
            'CORFU_GRECIA': 'Corfù - Grecia',
            'CEFALONIA_GRECIA': 'Cefalonia - Grecia',
            'OLBIA_SARDEGNA': 'Olbia - Sardegna',
            'CAGLIARI_SARDEGNA': 'Cagliari - Sardegna',
            'IBIZA_SPAAGNA': 'Ibiza - Spagna',
            'MINORCA_SPAAGNA': 'Minorca - Spagna',
            'BRAC_CROAZIA': 'Brac - Croazia',
            'BRINDISI_PUGLIA': 'Brindisi - Puglia'
        };
        
        var destLabel = destMap[dest] || dest;
        
        var adults = document.getElementById('secondAdultCard').classList.contains('hidden') ? 1 : 2;
        var childCount = children;
        var infantCount = infants;
        
        var html = '<div class="summary-row"><strong>Destinazione:</strong> ' + destLabel + '</div>';
        html += '<div class="summary-row"><strong>Date:</strong> ' + (d['entry.DATA_PARTENZA'] || '-') + ' - ' + (d['entry.DATA_RITORNO'] || '-') + '</div>';
        html += '<div class="summary-row"><strong>Durata:</strong> ' + nights + ' notti</div>';
        html += '<div class="summary-row"><strong>Viaggiatori:</strong> ' + adults + ' adulti';
        if (childCount > 0) html += ', ' + childCount + ' bambini';
        if (infantCount > 0) html += ', ' + infantCount + ' neonati';
        html += '</div>';
        html += '<div class="summary-row"><strong>Contatto:</strong> ' + (d['entry.NOME'] || '-') + ' ' + (d['entry.COGNOME'] || '') + '</div>';
        
        var summaryContent = document.getElementById('summaryContent');
        if (summaryContent) summaryContent.innerHTML = html;
    }

    // ============================================
    // FORM SUBMIT
    // ============================================
    function initFormSubmit() {
        var form = document.getElementById('bookingForm');
        if (!form) return;
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Sincronizza campi dinamici con campi nascosti
            syncDynamicFields();
            
            // Controlla la privacy manualmente
            var privacyCheckbox = document.getElementById('privacyCheckbox');
            if (!privacyCheckbox || !privacyCheckbox.checked) {
                showError(t[currentLang].required);
                return;
            }
            
            if (!validate(5)) {
                showError(t[currentLang].required);
                return;
            }
            
            var num = 'SA-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
            
            showModal('loadingModal');

            try {
                // Invia a Google Sheets
                await sendToGoogleSheets(num);
                
                // Prepara e invia WhatsApp
                var message = buildWhatsAppMessage(num);
                setTimeout(function() {
                    sendWhatsApp(decodeURIComponent(message));
                }, 1500);
                
                // Attendi per mostrare il modal di successo
                await new Promise(function(r) { setTimeout(r, 2500); });
                
                hideModal('loadingModal');
                document.getElementById('praticaNum').innerHTML = 'Numero pratica:<br><strong>' + num + '</strong>';
                showModal('successModal');
                
            } catch (error) {
                console.error('Error:', error);
                hideModal('loadingModal');
                document.getElementById('errorText').textContent = error.message || t[currentLang].error;
                showModal('errorModal');
            }
        });
    }
    
    // Sincronizza campi dinamici (bambini/neonati) con campi nascosti
    function syncDynamicFields() {
        // Raccolta dati bambini
        var bambiniData = [];
        var container = document.getElementById('childrenFields');
        if (container) {
            for (var i = 0; i < container.children.length; i++) {
                var row = container.children[i];
                var inputs = row.querySelectorAll('input');
                if (inputs.length >= 3) {
                    var nome = inputs[0].value.trim();
                    var cognome = inputs[1].value.trim();
                    // nascita è il terzo input (inputs[2])
                    var nascita = inputs[2].value.trim();
                    if (nome || cognome || nascita) {
                        bambiniData.push({
                            nome: nome,
                            cognome: cognome,
                            nascita: nascita
                        });
                    }
                }
            }
        }
        
        // Raccolta dati neonati
        var neonatiData = [];
        var infantContainer = document.getElementById('infantsFields');
        if (infantContainer) {
            for (var j = 0; j < infantContainer.children.length; j++) {
                var row = infantContainer.children[j];
                var inputs = row.querySelectorAll('input');
                if (inputs.length >= 3) {
                    var nome = inputs[0].value.trim();
                    var cognome = inputs[1].value.trim();
                    // nascita è il terzo input (inputs[2])
                    var nascita = inputs[2].value.trim();
                    if (nome || cognome || nascita) {
                        neonatiData.push({
                            nome: nome,
                            cognome: cognome,
                            nascita: nascita
                        });
                    }
                }
            }
        }
        
        // Imposta i valori nei campi nascosti come JSON
        var numBambiniInput = document.querySelector('[name="entry.NUM_BAMBINI"]');
        var numNeonatiInput = document.querySelector('[name="entry.NUM_NEONATI"]');
        
        if (numBambiniInput) {
            numBambiniInput.value = JSON.stringify(bambiniData);
        }
        if (numNeonatiInput) {
            numNeonatiInput.value = JSON.stringify(neonatiData);
        }
    }

    function buildWhatsAppMessage(num) {
        var form = document.getElementById('bookingForm');
        var formData = new FormData(form);
        var d = {};
        formData.forEach(function(value, key) {
            d[key] = value;
        });
        
        var nome = (d['entry.NOME'] || '').trim();
        var cognome = (d['entry.COGNOME'] || '').trim();
        
        // Destinazione
        var dest = d['entry.DESTINAZIONE'] || '';
        if (dest === 'ALTRO') dest = d['entry.ALTRO_DESTINAZIONE'] || 'Altra';
        var destMap = {
            'CATANIA_SICILIA': 'Catania - Sicilia',
            'LAMEZIA_CALABRIA': 'Lamezia Terme - Calabria',
            'SALONICCO_GRECIA': 'Salonicco/Halkidiki - Grecia',
            'PARVALIA_GRECIA': 'Preveza/Lefkada - Grecia',
            'CORFU_GRECIA': 'Corfù - Grecia',
            'CEFALONIA_GRECIA': 'Cefalonia - Grecia',
            'OLBIA_SARDEGNA': 'Olbia - Sardegna',
            'CAGLIARI_SARDEGNA': 'Cagliari - Sardegna',
            'IBIZA_SPAAGNA': 'Ibiza - Spagna',
            'MINORCA_SPAAGNA': 'Minorca - Spagna',
            'BRAC_CROAZIA': 'Brac - Croazia',
            'BRINDISI_PUGLIA': 'Brindisi - Puglia'
        };
        dest = destMap[dest] || dest;
        
        // Calcola viaggiatori
        var adulti = 1;
        if (!document.getElementById('secondAdultCard').classList.contains('hidden')) adulti++;
        if (!document.getElementById('thirdAdultCard').classList.contains('hidden')) adulti++;
        if (!document.getElementById('fourthAdultCard').classList.contains('hidden')) adulti++;
        var bambini = children;
        var neonati = infants;
        
        var message = '*NUOVA RICHIESTA*\n';
        message += '━━━━━━━━━━━━━━━━━━━━\n\n';
        message += '📋 *PRATICA*\n';
        message += num + '\n\n';
        message += '👤 *CLIENTE*\n';
        message += nome + ' ' + cognome + '\n';
        message += '📞 ' + (d['entry.TELEFONO'] || '-') + '\n';
        message += '📧 ' + (d['entry.EMAIL'] || '-') + '\n\n';
        message += '✈️ *VIAGGIO*\n';
        message += '📍 ' + dest + '\n';
        message += '📅 Partenza: ' + (d['entry.DATA_PARTENZA'] || '-') + '\n';
        message += '📅 Ritorno: ' + (d['entry.DATA_RITORNO'] || '-') + '\n';
        message += '🌙 Notti: ' + (d['entry.NOTTI'] || '-') + '\n';
        message += '💰 Budget: ' + (d['entry.BUDGET'] || '-') + '\n';
        message += '🏨 Trattamento: ' + (d['entry.TRATTAMENTO'] || '-') + '\n';
        message += '⭐ Stelle: ' + (d['entry.STELLE'] || '-') + '\n\n';
        message += '👥 *VIAGGIATORI*\n';
        message += adulti + ' adulti';
        if (bambini > 0) message += ', ' + bambini + ' bambini';
        if (neonati > 0) message += ', ' + neonati + ' neonati';
        message += '\n\n';
        
        if (d['entry.MESSAGGIO']) {
            message += '📝 *NOTE*\n' + d['entry.MESSAGGIO'];
        }
        
        return encodeURIComponent(message);
    }

    // ============================================
    // GDPR INITIAL MODAL
    // ============================================
    function initGDPRModal() {
        var gdprAccepted = localStorage.getItem('skyalps_gdpr_accepted');
        if (!gdprAccepted) {
            showModal('initialGDPRModal');
        }
    }

    window.acceptInitialGDPR = function() {
        localStorage.setItem('skyalps_gdpr_accepted', 'true');
        hideModal('initialGDPRModal');
    };

    // ============================================
    // GDPR MODAL
    // ============================================
    window.showGDPRModal = function() {
        showModal('gdprModal');
    };

    window.acceptGDPR = function() {
        var checkbox = document.getElementById('privacyCheckbox');
        if (checkbox) {
            checkbox.checked = true;
            checkbox.classList.add('valid');
        }
        hideModal('gdprModal');
        saveData();
    };

    function sendWhatsApp(message) {
        var waUrl = 'https://wa.me/' + CONFIG.WHATSAPP_NUM + '?text=' + message;
        window.open(waUrl, '_blank');
    }

    async function sendToGoogleSheets(num) {
        // Il Google Form è già collegato al Google Sheet
        // Basta inviare a Google Forms e i dati appaiono nel sheet
        return await sendToGoogleForms(num);
    }
    
    async function sendToGoogleForms(num) {
        if (!CONFIG.GOOGLE_FORM.FORM_URL) {
            console.log('Google Form URL not configured');
            return false;
        }
        
        try {
            var form = document.getElementById('bookingForm');
            var formData = new FormData(form);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            
            // Build the URL with all form fields
            var url = CONFIG.GOOGLE_FORM.FORM_URL.replace('/viewform', '/formResponse');
            var params = new URLSearchParams();
            
            Object.keys(CONFIG.GOOGLE_FORM.ENTRY_IDS).forEach(function(key) {
                var entryId = CONFIG.GOOGLE_FORM.ENTRY_IDS[key];
                var formKey = 'entry.' + key;
                var value = data[formKey] || '';
                if (entryId && value) {
                    params.append('entry.' + entryId, value);
                }
            });
            
            // Add pratica number
            if (CONFIG.GOOGLE_FORM.ENTRY_IDS.PRATICA) {
                params.append('entry.' + CONFIG.GOOGLE_FORM.ENTRY_IDS.PRATICA, num);
            }
            
            var fullUrl = url + '?' + params.toString();
            
            // Use no-cors to avoid CORS issues
            await fetch(fullUrl, {
                method: 'POST',
                mode: 'no-cors'
            });
            
            console.log('Form submitted successfully');
            return true;
        } catch (e) {
            console.error('Google Forms error:', e);
            return false;
        }
    }

    // ============================================
    // MODALS
    // ============================================
    function showModal(modalId) {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById(modalId).classList.add('active');
    }

    function hideModal(modalId) {
        document.getElementById('modalOverlay').classList.remove('active');
        document.getElementById(modalId).classList.remove('active');
    }

    window.closeModal = function(modalId) {
        hideModal(modalId);
    };

    function showError(message) {
        // Usa un alert temporaneo o implementa un toast
        alert(message);
    }
    
    // ============================================
    // TOGGLE FUNCTIONS
    // ============================================
    window.toggleCard = function(headerEl) {
        var card = headerEl.closest('.traveler-card');
        if (card) {
            card.classList.toggle('expanded');
            saveData();
        }
    };
    
    window.toggleSummary = function() {
        var summary = document.getElementById('summaryBox');
        if (summary) {
            summary.classList.toggle('expanded');
        }
    };

    // ============================================
    // PHONE INPUT
    // ============================================
    function initPhoneInput() {
        var prefixSelect = document.getElementById('phonePrefix');
        var phoneInput = document.getElementById('phoneNumber');
        
        if (!prefixSelect || !phoneInput) return;
        
        function updateFullPhone() {
            var prefix = prefixSelect.value;
            var number = phoneInput.value.trim();
            
            // Combina prefisso + numero solo se necessario per il salvataggio
            // Il campo phoneInput è già il campo TELEFONO
            if (prefix === 'other') {
                phoneInput.value = number;
            } else {
                // Combina solo se non è già combinato
                if (!number.startsWith(prefix)) {
                    phoneInput.value = prefix + ' ' + number;
                }
            }
        }
        
        prefixSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                phoneInput.placeholder = '+xx xxx xxx xxxx';
            } else {
                phoneInput.placeholder = '3xx xxx xxxx';
            }
            updateFullPhone();
            saveData();
        });
        
        phoneInput.addEventListener('blur', function() {
            updateFullPhone();
            saveData();
        });
    }

    // ============================================
    // RESET
    // ============================================
    window.resetForm = function() {
        // Clear localStorage first
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        // Reload page to reset everything including datepickers
        window.location.reload();
    };
    
    // Esporta per debug
    window.SKYALPS_CONFIG = CONFIG;
})();
