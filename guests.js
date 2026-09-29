/* =========================================================
   عناصر الصفحة
========================================================= */

const guestsContainer =
    document.getElementById(
        "guestsContainer"
    );

const searchGuestInput =
    document.getElementById(
        "searchGuest"
    );

const listTitle =
    document.getElementById(
        "listTitle"
    );

const listCount =
    document.getElementById(
        "listCount"
    );


/* =========================================================
   فلاتر الحالة
========================================================= */

const statusFilterButtons =
    document.querySelectorAll(
        ".status-filter"
    );


/* =========================================================
   فلاتر الجنس
========================================================= */

const genderFilterButtons =
    document.querySelectorAll(
        ".gender-filter-btn"
    );


/* =========================================================
   نافذة تعديل الاسم
========================================================= */

const editNameModal =
    document.getElementById(
        "editNameModal"
    );

const editGuestNameInput =
    document.getElementById(
        "editGuestNameInput"
    );

const saveGuestNameBtn =
    document.getElementById(
        "saveGuestNameBtn"
    );

const cancelEditNameBtn =
    document.getElementById(
        "cancelEditNameBtn"
    );


/* =========================================================
   نافذة الجنس
========================================================= */

const genderModal =
    document.getElementById(
        "genderModal"
    );

const genderGuestName =
    document.getElementById(
        "genderGuestName"
    );

const setMaleBtn =
    document.getElementById(
        "setMaleBtn"
    );

const setFemaleBtn =
    document.getElementById(
        "setFemaleBtn"
    );

const clearGenderBtn =
    document.getElementById(
        "clearGenderBtn"
    );

const cancelGenderBtn =
    document.getElementById(
        "cancelGenderBtn"
    );


/* =========================================================
   المتغيرات
========================================================= */

let guests = [];

let currentStatusFilter =
    "all";

let currentGenderFilter =
    "all";

let editingGuestId =
    null;

let genderEditingGuestId =
    null;


/* =========================================================
   تشغيل الصفحة
========================================================= */

startGuestsPage();


async function startGuestsPage() {

    const ready =
        await initializeUser();


    if (!ready) {

        return;
    }


    readFiltersFromUrl();


    await loadGuests();
}


/* =========================================================
   قراءة الفلتر من الرابط
========================================================= */

function readFiltersFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const status =
        params.get(
            "filter"
        );


    const gender =
        params.get(
            "gender"
        );


    if (
        status === "invited" ||
        status === "not-invited"
    ) {

        currentStatusFilter =
            status;
    }


    if (
        gender === "male" ||
        gender === "female" ||
        gender === "unknown"
    ) {

        currentGenderFilter =
            gender;
    }


    updateStatusFilterButtons();

    updateGenderFilterButtons();
}


/* =========================================================
   تحميل المدعوين
========================================================= */

async function loadGuests() {

    let query =
        supabaseClient

            .from("guests")

            .select(`
                *,
                profiles (
                    username
                )
            `)

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    /*
        العضو يرى فقط المدعوين
        الذين أضافهم.
    */

    if (
        currentProfile.role !==
        "admin"
    ) {

        query =
            query.eq(
                "created_by",
                currentUser.id
            );
    }


    const {
        data,
        error
    } =
        await query;


    if (error) {

        console.error(
            "Load guests error:",
            error
        );


        guestsContainer.innerHTML = `
            <div class="empty-state">

                تعذر تحميل المدعوين

            </div>
        `;


        showToast(
            "تعذر تحميل قائمة المدعوين",
            "error"
        );


        return;
    }


    guests =
        data || [];


    applyFilters();
}


/* =========================================================
   تطبيق البحث والفلاتر
========================================================= */

function applyFilters() {

    const searchText =
        normalizeName(
            searchGuestInput.value
        );


    let filtered =
        [...guests];


    /* ===========================
       فلتر حالة الدعوة
    =========================== */

    if (
        currentStatusFilter ===
        "invited"
    ) {

        filtered =
            filtered.filter(
                function (guest) {

                    return guest.status ===
                        "invited";
                }
            );

    } else if (
        currentStatusFilter ===
        "not-invited"
    ) {

        filtered =
            filtered.filter(
                function (guest) {

                    return guest.status ===
                        "not-invited";
                }
            );
    }


    /* ===========================
       فلتر الجنس
    =========================== */

    if (
        currentGenderFilter ===
        "male"
    ) {

        filtered =
            filtered.filter(
                function (guest) {

                    return guest.gender ===
                        "male";
                }
            );

    } else if (
        currentGenderFilter ===
        "female"
    ) {

        filtered =
            filtered.filter(
                function (guest) {

                    return guest.gender ===
                        "female";
                }
            );

    } else if (
        currentGenderFilter ===
        "unknown"
    ) {

        filtered =
            filtered.filter(
                function (guest) {

                    return (
                        guest.gender === null ||
                        guest.gender === undefined ||
                        guest.gender === ""
                    );
                }
            );
    }


    /* ===========================
       البحث
    =========================== */

    if (searchText) {

        filtered =
            filtered.filter(
                function (guest) {

                    return normalizeName(
                        guest.name
                    ).includes(
                        searchText
                    );
                }
            );
    }


    displayGuests(
        filtered
    );


    updateListHeader(
        filtered.length
    );
}


/* =========================================================
   تحديث عنوان القائمة
========================================================= */

function updateListHeader(
    count
) {

    let statusText =
        "جميع المدعوين";


    if (
        currentStatusFilter ===
        "invited"
    ) {

        statusText =
            "من تمت دعوتهم";

    } else if (
        currentStatusFilter ===
        "not-invited"
    ) {

        statusText =
            "من لم تتم دعوتهم";
    }


    let genderText =
        "";


    if (
        currentGenderFilter ===
        "male"
    ) {

        genderText =
            " - الرجال";

    } else if (
        currentGenderFilter ===
        "female"
    ) {

        genderText =
            " - النساء";

    } else if (
        currentGenderFilter ===
        "unknown"
    ) {

        genderText =
            " - غير محدد";
    }


    listTitle.textContent =
        statusText +
        genderText;


    listCount.textContent =
        `${count} مدعو`;
}


/* =========================================================
   فلتر حالة الدعوة
========================================================= */

statusFilterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentStatusFilter =
                    button.dataset.filter;


                updateStatusFilterButtons();


                applyFilters();
            }
        );

    }
);


function updateStatusFilterButtons() {

    statusFilterButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.filter ===
                    currentStatusFilter
            );
        }
    );
}


/* =========================================================
   فلتر الجنس
========================================================= */

genderFilterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentGenderFilter =
                    button.dataset.gender;


                updateGenderFilterButtons();


                applyFilters();
            }
        );

    }
);


function updateGenderFilterButtons() {

    genderFilterButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.gender ===
                    currentGenderFilter
            );
        }
    );
}


/* =========================================================
   البحث
========================================================= */

searchGuestInput.addEventListener(
    "input",
    applyFilters
);


/* =========================================================
   عرض المدعوين
========================================================= */

function displayGuests(
    list
) {

    guestsContainer.innerHTML =
        "";


    if (
        list.length === 0
    ) {

        guestsContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    👥
                </div>

                <h3>
                    لا توجد نتائج
                </h3>

                <p>
                    لا يوجد مدعوون مطابقون للبحث أو الفلاتر الحالية
                </p>

            </div>
        `;


        return;
    }


    list.forEach(
        function (guest) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "mobile-guest-card";


            const invited =
                guest.status ===
                "invited";


            const statusText =
                invited
                    ? "تمت دعوته"
                    : "لم تتم دعوته";


            const statusClass =
                invited
                    ? "guest-status invited"
                    : "guest-status pending";


            /* ===========================
               الجنس
            =========================== */

            let genderText =
                "غير محدد";


            let genderClass =
                "unknown";


            let genderIcon =
                "❔";


            if (
                guest.gender ===
                "male"
            ) {

                genderText =
                    "ذكر";

                genderClass =
                    "male";

                genderIcon =
                    "👨";

            } else if (
                guest.gender ===
                "female"
            ) {

                genderText =
                    "أنثى";

                genderClass =
                    "female";

                genderIcon =
                    "👩";
            }


            /* ===========================
               من أضافه
            =========================== */

            const creatorHtml =
                currentProfile.role ===
                "admin"

                    ? `
                        <div class="guest-meta-row">

                            <span>
                                أضافه
                            </span>

                            <strong>
                                ${
                                    escapeHtml(
                                        guest.profiles
                                            ?.username
                                        ||
                                        "غير معروف"
                                    )
                                }
                            </strong>

                        </div>
                    `

                    : "";


            /* ===========================
               الحذف للمدير
            =========================== */

            const deleteButton =
                currentProfile.role ===
                "admin"

                    ? `
                        <button
                            class="guest-action-btn danger"
                            onclick="
                                deleteGuest(
                                    ${guest.id}
                                )
                            "
                        >
                            حذف
                        </button>
                    `

                    : "";


            card.innerHTML = `

                <div class="guest-card-top">

                    <div>

                        <h3 class="guest-name">

                            ${escapeHtml(
                                guest.name
                            )}

                        </h3>


                        <div class="guest-badges">

                            <span
                                class="${statusClass}"
                            >
                                ${statusText}
                            </span>


                            <span
                                class="
                                    gender-badge
                                    ${genderClass}
                                "
                            >

                                ${genderIcon}

                                ${genderText}

                            </span>

                        </div>

                    </div>


                    <div class="guest-count-badge">

                        <strong>
                            ${guest.guest_count}
                        </strong>

                        <span>
                            شخص
                        </span>

                    </div>

                </div>


                <div class="guest-meta">

                    ${creatorHtml}

                    <div class="guest-meta-row">

                        <span>
                            الجنس
                        </span>

                        <strong>
                            ${genderText}
                        </strong>

                    </div>

                </div>


                <div class="guest-mobile-actions">

                    <button
                        class="guest-action-btn"
                        onclick="
                            editGuestName(
                                ${guest.id}
                            )
                        "
                    >
                        تعديل الاسم
                    </button>


                    <button
                        class="guest-action-btn gender-action"
                        onclick="
                            openGenderModal(
                                ${guest.id}
                            )
                        "
                    >
                        تحديد الجنس
                    </button>


                    <button
                        class="guest-action-btn warning"
                        onclick="
                            toggleGuestStatus(
                                ${guest.id}
                            )
                        "
                    >

                        ${
                            invited
                                ? "إلغاء الدعوة"
                                : "تمت دعوته"
                        }

                    </button>


                    ${deleteButton}

                </div>

            `;


            guestsContainer.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   تعديل الاسم
========================================================= */

function editGuestName(
    id
) {

    const guest =
        guests.find(
            function (item) {

                return item.id === id;
            }
        );


    if (!guest) {

        return;
    }


    editingGuestId =
        id;


    editGuestNameInput.value =
        guest.name;


    editNameModal.classList.add(
        "show"
    );


    setTimeout(
        function () {

            editGuestNameInput.focus();

            editGuestNameInput.select();

        },
        100
    );
}


/* =========================================================
   إغلاق تعديل الاسم
========================================================= */

function closeEditModal() {

    editNameModal.classList.remove(
        "show"
    );


    editGuestNameInput.value =
        "";


    editingGuestId =
        null;
}


cancelEditNameBtn.addEventListener(
    "click",
    closeEditModal
);


editNameModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            editNameModal
        ) {

            closeEditModal();
        }
    }
);


/* =========================================================
   حفظ الاسم
========================================================= */

saveGuestNameBtn.addEventListener(
    "click",
    saveGuestName
);


async function saveGuestName() {

    if (
        editingGuestId ===
        null
    ) {

        return;
    }


    const guest =
        guests.find(
            function (item) {

                return item.id ===
                    editingGuestId;
            }
        );


    if (!guest) {

        closeEditModal();

        return;
    }


    const newName =
        editGuestNameInput
            .value
            .trim()
            .replace(
                /\s+/g,
                " "
            );


    if (!newName) {

        showToast(
            "يرجى إدخال الاسم",
            "warning"
        );

        return;
    }


    if (
        normalizeName(
            newName
        ) ===
        normalizeName(
            guest.name
        )
    ) {

        closeEditModal();

        return;
    }


    const duplicate =
        guests.some(
            function (item) {

                return (
                    item.id !==
                        editingGuestId
                    &&
                    normalizeName(
                        item.name
                    ) ===
                    normalizeName(
                        newName
                    )
                );
            }
        );


    if (duplicate) {

        showToast(
            "يوجد مدعو آخر بهذا الاسم",
            "warning"
        );

        return;
    }


    saveGuestNameBtn.disabled =
        true;


    saveGuestNameBtn.textContent =
        "جاري الحفظ...";


    const {
        error
    } =
        await supabaseClient

            .from("guests")

            .update({
                name:
                    newName
            })

            .eq(
                "id",
                editingGuestId
            );


    saveGuestNameBtn.disabled =
        false;


    saveGuestNameBtn.textContent =
        "حفظ التعديل";


    if (error) {

        console.error(
            error
        );


        if (
            error.code ===
            "23505"
        ) {

            showToast(
                "يوجد مدعو آخر بهذا الاسم",
                "warning"
            );

        } else {

            showToast(
                "تعذر تعديل الاسم",
                "error"
            );

        }


        return;
    }


    closeEditModal();


    await loadGuests();


    showToast(
        "تم تعديل الاسم بنجاح",
        "success"
    );
}


/* =========================================================
   نافذة الجنس
========================================================= */

function openGenderModal(
    id
) {

    const guest =
        guests.find(
            function (item) {

                return item.id === id;
            }
        );


    if (!guest) {

        return;
    }


    genderEditingGuestId =
        id;


    genderGuestName.textContent =
        `المدعو: ${guest.name}`;


    genderModal.classList.add(
        "show"
    );
}


/* =========================================================
   إغلاق نافذة الجنس
========================================================= */

function closeGenderModal() {

    genderModal.classList.remove(
        "show"
    );


    genderEditingGuestId =
        null;
}


cancelGenderBtn.addEventListener(
    "click",
    closeGenderModal
);


genderModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            genderModal
        ) {

            closeGenderModal();
        }
    }
);


/* =========================================================
   ذكر
========================================================= */

setMaleBtn.addEventListener(
    "click",
    function () {

        updateGuestGender(
            "male"
        );
    }
);


/* =========================================================
   أنثى
========================================================= */

setFemaleBtn.addEventListener(
    "click",
    function () {

        updateGuestGender(
            "female"
        );
    }
);


/* =========================================================
   غير محدد
========================================================= */

clearGenderBtn.addEventListener(
    "click",
    function () {

        updateGuestGender(
            null
        );
    }
);


/* =========================================================
   تحديث الجنس في Supabase
========================================================= */

async function updateGuestGender(
    gender
) {

    if (
        genderEditingGuestId ===
        null
    ) {

        return;
    }


    setMaleBtn.disabled =
        true;

    setFemaleBtn.disabled =
        true;

    clearGenderBtn.disabled =
        true;


    const {
        error
    } =
        await supabaseClient

            .from("guests")

            .update({
                gender:
                    gender
            })

            .eq(
                "id",
                genderEditingGuestId
            );


    setMaleBtn.disabled =
        false;

    setFemaleBtn.disabled =
        false;

    clearGenderBtn.disabled =
        false;


    if (error) {

        console.error(
            "Update gender error:",
            error
        );


        showToast(
            "تعذر تعديل الجنس",
            "error"
        );

        return;
    }


    closeGenderModal();


    await loadGuests();


    let message =
        "تم تعديل الجنس";


    if (
        gender === "male"
    ) {

        message =
            "تم تحديد المدعو كذكر";

    } else if (
        gender === "female"
    ) {

        message =
            "تم تحديد المدعو كأنثى";

    } else {

        message =
            "تم جعل الجنس غير محدد";
    }


    showToast(
        message,
        "success"
    );
}


/* =========================================================
   تغيير حالة الدعوة
========================================================= */

async function toggleGuestStatus(
    id
) {

    const guest =
        guests.find(
            function (item) {

                return item.id === id;
            }
        );


    if (!guest) {

        return;
    }


    const newStatus =
        guest.status ===
        "invited"
            ? "not-invited"
            : "invited";


    const {
        error
    } =
        await supabaseClient

            .from("guests")

            .update({
                status:
                    newStatus
            })

            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            error
        );


        showToast(
            "تعذر تغيير الحالة",
            "error"
        );

        return;
    }


    await loadGuests();


    showToast(
        newStatus === "invited"
            ? "تم تسجيل المدعو كـ تمت دعوته"
            : "تم إرجاع المدعو إلى لم تتم دعوته",
        "success"
    );
}


/* =========================================================
   حذف المدعو
========================================================= */

async function deleteGuest(
    id
) {

    if (
        currentProfile.role !==
        "admin"
    ) {

        return;
    }


    const guest =
        guests.find(
            function (item) {

                return item.id === id;
            }
        );


    if (!guest) {

        return;
    }


    const confirmed =
        confirm(
            `هل أنت متأكد من حذف "${guest.name}"؟`
        );


    if (!confirmed) {

        return;
    }


    const {
        error
    } =
        await supabaseClient

            .from("guests")

            .delete()

            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            error
        );


        showToast(
            "تعذر حذف المدعو",
            "error"
        );

        return;
    }


    await loadGuests();


    showToast(
        "تم حذف المدعو",
        "success"
    );
}


/* =========================================================
   Enter / Escape
========================================================= */

editGuestNameInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            saveGuestName();

        } else if (
            event.key ===
            "Escape"
        ) {

            closeEditModal();
        }
    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeGenderModal();
        }
    }
);