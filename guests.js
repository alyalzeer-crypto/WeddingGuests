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

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


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


let guests = [];

let currentFilter =
    "all";

let editingGuestId =
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


    readFilterFromUrl();


    await loadGuests();
}


/* =========================================================
   قراءة الفلتر من الرابط
========================================================= */

function readFilterFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const filter =
        params.get(
            "filter"
        );


    if (
        filter === "invited" ||
        filter === "not-invited"
    ) {

        currentFilter =
            filter;
    }


    updateFilterButtons();
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
        العضو يرى مدعويه فقط.
        المدير يرى الجميع.
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
   تطبيق البحث والفلتر
========================================================= */

function applyFilters() {

    const searchText =
        normalizeName(
            searchGuestInput.value
        );


    let filtered =
        [...guests];


    if (
        currentFilter ===
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
        currentFilter ===
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
   عنوان القائمة
========================================================= */

function updateListHeader(
    count
) {

    if (
        currentFilter ===
        "all"
    ) {

        listTitle.textContent =
            "جميع المدعوين";

    } else if (
        currentFilter ===
        "invited"
    ) {

        listTitle.textContent =
            "من تمت دعوتهم";

    } else {

        listTitle.textContent =
            "من لم تتم دعوتهم";
    }


    listCount.textContent =
        `${count} مدعو`;
}


/* =========================================================
   أزرار الفلترة
========================================================= */

filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                currentFilter =
                    button.dataset.filter;


                updateFilterButtons();


                applyFilters();
            }
        );

    }
);


function updateFilterButtons() {

    filterButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.filter ===
                    currentFilter
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
                    لا يوجد مدعوون مطابقون للبحث أو الفلتر الحالي
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

                        <span
                            class="${statusClass}"
                        >
                            ${statusText}
                        </span>

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
   فتح تعديل الاسم
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
   حفظ تعديل الاسم
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


    /*
        فحص تكرار الاسم.
    */

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
   تغيير الحالة
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
   حذف
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
   Enter في نافذة التعديل
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