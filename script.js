js
/* =====================================================
   script.js - all the JavaScript for the invitation
   (loaded with "defer" in index.html, BEFORE Alpine)
   ===================================================== */

// ---------- 1) Guest name for the page title ----------
window.guestName = "";


// ---------- 2) Date helpers (Khmer numbers) ----------
dayjs.locale('km');

function convertToKhmerNumerals(number) {
    const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return number.toString().split('').map(digit => khmerNumerals[digit] || digit).join('');
}

function replaceNumbersWithKhmer(text) {
    return text.split('').map(char => {
        const digit = parseInt(char, 10);
        return isNaN(digit) ? char : convertToKhmerNumerals(digit);
    }).join('');
}


// ---------- 3) Language store (Khmer / English button) ----------
document.addEventListener('alpine:init', () => {
    Alpine.store('lang', {
        current: localStorage.getItem('language') || 'km',
        translations: {
            "km": {
                "page_title": "សិរីមង្គលអាពាហ៍ពិពាហ៍",
                "wedding_ceremony": "សិរីមង្គលអាពាហ៍ពិពាហ៍",
                "invitation": "សូមគោរពអញ្ជើញ",
                "honored_invitation": "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
                "guests": "ឯកឧត្តម លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា  អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធិពរជ័យសិរីសួស្តី ជ័យមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំទាំងពីរ។",
                "invitation_text": "អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធិពរជ័យ សិរីសួស្តី ជ័យមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំទាំងពីរ។",
                "schedule": "កម្មវិធីមង្គលអាពាហ៍ពិពាហ៍",
                "location": "ទីតាំងកម្មវិធីមង្គល",
                "thank_you_message": "វត្តមានឯកឧត្តម លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ជាកិត្តិយសដ៏ឧត្តុង្គឧត្តម ចំពោះគ្រួសាររបស់យើងខ្ញុំ។",
                "switch_to_english": "English"
            },
            "en": {
                "page_title": "Wedding Invitation",
                "wedding_ceremony": "Celebration of Marriage",
                "invitation": "Request the honor of your presence",
                "honored_invitation": "We are honored to invite",
                "guests": "Your Excellency, Oknha, Distinguished Ladies and Gentlemen, we are deeply honored to invite you as our presiding guests to bestow your blessings and share in the joyous celebration of our marriage ceremony.",
                "invitation_text": "To share in the joy and celebration as we unite in marriage. Your presence and blessings will make our special day complete.",
                "schedule": "Order of Ceremonies",
                "location": "Reception Venue",
                "thank_you_message": "Your esteemed presence would be our greatest honor and bring immense joy to both our families.",
                "switch_to_khmer": "ភាសាខ្មែរ"
            }
        },
        get text() {
            return this.translations[this.current]
        },
        toggle() {
            this.current = this.current === 'km' ? 'en' : 'km';
            localStorage.setItem('language', this.current);
            this.updateDocumentTitle();
        },
        updateDocumentTitle() {
            let title = this.translations[this.current].page_title;
            if (window.guestName) {
                title += ' | ' + this.translations[this.current].invitation + ' ' + window.guestName;
            }
            document.title = title;
        },
        init() {
            this.updateDocumentTitle();
        }
    })
});


// ---------- 4) Date and time formatters ----------
function dateFormatter(eventDate = null, showTime = false) {
    return {
        formattedDate: '',
        eventDate: eventDate ?? "2026-12-11 17:00:00",
        showTime: showTime,
        init() {
            // Watch for language changes and re-format
            this.$watch('$store.lang.current', () => {
                this.formatDate();
            });
            this.formatDate();
        },
        formatDate() {
            const currentLang = Alpine.store('lang').current;

            if (currentLang === 'en') {
                // --- ENGLISH FORMATTING ---
                let d = dayjs(this.eventDate).locale('en');
                this.formattedDate = d.format('dddd, MMMM D, YYYY');

                if (this.showTime) {
                    const dateObj = new Date(this.eventDate);
                    const locale = (window.dateFns && window.dateFns.locale && window.dateFns.locale.enUS) ? window.dateFns.locale.enUS : undefined;
                    const timeString = dateFns.format(dateObj, 'h:mm a', { locale: locale });
                    this.formattedDate += ` ${timeString}`;
                }

            } else {
                // --- KHMER FORMATTING ---
                let d = dayjs(this.eventDate).locale('km');
                let formattedDate = d.format('ថ្ងៃdddd ទី DD ខែ MMMM ឆ្នាំ YYYY');

                const dayInKhmer = convertToKhmerNumerals(d.date());
                const yearInKhmer = convertToKhmerNumerals(d.year());

                formattedDate = formattedDate
                    .replace(d.date(), dayInKhmer)
                    .replace(d.year(), yearInKhmer);

                if (this.showTime) {
                    const dateObj = new Date(this.eventDate);
                    const timeInKhmer = dateFns.format(dateObj, 'ម៉ោង h:mm B', {
                        locale: dateFns.locale.km
                    });
                    const timeInKhmerNumerals = replaceNumbersWithKhmer(timeInKhmer);
                    this.formattedDate = `${formattedDate} ${timeInKhmerNumerals}`;
                } else {
                    this.formattedDate = formattedDate;
                }
            }
        }
    }
}

function timeFormatter(time) {
    return {
        time: time,
        formattedTime: '',
        init() {
            this.$watch('$store.lang.current', () => {
                this.formatStringToTime(this.time);
            });
            this.formatStringToTime(this.time);
        },
        formatStringToTime(timeString) {
            const currentLang = Alpine.store('lang').current;
            const [hour, minute, second = 0] = timeString.split(':').map(Number);

            const tempDate = new Date();
            const updatedDate = dateFns.setSeconds(
                dateFns.setMinutes(dateFns.setHours(tempDate, hour), minute),
                second
            );

            if (currentLang === 'en') {
                // ENGLISH TIME
                const locale = (window.dateFns && window.dateFns.locale && window.dateFns.locale.enUS)
                    ? window.dateFns.locale.enUS
                    : undefined;
                this.formattedTime = dateFns.format(updatedDate, 'h:mm a', {
                    locale: locale
                });
            } else {
                // KHMER TIME
                let formattedTime = dateFns.format(updatedDate, "'ម៉ោង' h:mm BBBB", {
                    locale: dateFns.locale.km
                });

                // date-fns treats 12:00 as afternoon; make exactly 12:xx "noon" (ពេលថ្ងៃត្រង់)
                if (hour === 12) {
                    formattedTime = formattedTime.replace('ពេលរសៀល', 'ពេលថ្ងៃត្រង់');
                }

                const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

                this.formattedTime = formattedTime.split('').map(char => {
                    return char.match(/\d/) ? khmerDigits[parseInt(char)] : char;
                }).join('');
            }
        }
    }
}


// ---------- 5) Falling petals inside the cover card ----------
(function () {
    var card = document.getElementById('card');
    if (!card) return;

    var petalCount = 28;   // change to have more or fewer
    for (var i = 0; i < petalCount; i++) {
        var p = document.createElement('span');
        var size = 5 + Math.random() * 7;
        p.className = 'petal';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = size + 'px';
        p.style.height = size * 1.2 + 'px';
        p.style.animationDuration = 7 + Math.random() * 8 + 's';
        p.style.animationDelay = -Math.random() * 15 + 's';
        card.appendChild(p);
    }
})();


// ---------- 6) Front page: song, gold hearts, open button ----------
(function () {
    // Optional guest name from the link, e.g. ?guest=សុខា
    var guest = new URLSearchParams(location.search).get('guest');
    if (guest) document.getElementById('fp-guest').textContent = guest;

    // Falling gold hearts: they start ONLY after clicking open
    var heartsStarted = false;
    function startHearts() {
        if (heartsStarted) return;
        heartsStarted = true;

        var heartCount = 10;   // number of falling hearts
        for (var i = 0; i < heartCount; i++) {
            var heart = document.createElement('span');
            heart.className = 'gold-heart';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = 5 + Math.random() * 7 + 's';
            heart.style.animationDelay = -Math.random() * 10 + 's';
            document.body.appendChild(heart);
        }
    }

    // Click "open": play the song, start the hearts, unlock scrolling, slide down
    document.getElementById('fp-open').addEventListener('click', function () {
        var music = document.getElementById('bg-music');
        if (music) music.play().catch(function () {});

        startHearts();
        document.body.classList.remove('front-locked');
        setTimeout(function () {
            document.getElementById('theapka-template').scrollIntoView({ behavior: 'smooth' });
        }, 50);
    });
})();
