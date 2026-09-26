/* =========================================================
   عناصر الصفحة
========================================================= */

const guestNameInput =
    document.getElementById("guestName");

const guestCountInput =
    document.getElementById("guestCount");

const guestStatusInput =
    document.getElementById("guestStatus");

const addGuestBtn =
    document.getElementById("addGuestBtn");

const guestsContainer =
    document.getElementById("guestsContainer");

const searchGuestInput =
    document.getElementById("searchGuest");

const totalGuestsElement =
    document.getElementById("totalGuests");

const invitedGuestsElement =
    document.getElementById("invitedGuests");

const notInvitedGuestsElement =
    document.getElementById("notInvitedGuests");

const logoutBtn =
    document.getElementById("logoutBtn");

const userEmailElement =
    document.getElementById("userEmail");


/* =========================================================
   بطاقات الفلترة
========================================================= */

const totalCard =
    document.getElementById("totalCard");

const invitedCard =
    document.getElementById("invitedCard");

const notInvitedCard =
    document.getElementById("notInvitedCard");

const currentFilterText =
    document.getElementById("currentFilterText");


/* =========================================================
   Toast
========================================================= */

const toast =
    document.getElementById("toast");


/* =========================================================
   نافذة تعديل الاسم
========================================================= */

const editNameModal =
    document.getElementById("editNameModal");

const editGuestNameInput =
    document.getElementById("editGuestNameInput");

const saveGuestNameBtn =
    document.getElementById("saveGuestNameBtn");

const cancelEditNameBtn =
    document.getElementById("cancelEditNameBtn");


/* =========================================================
   متغيرات عامة
========================================================= */

let guests = [];

let currentUser = null;

let currentProfile = null;

let editingGuestId = null;

let toastTimer = null;

let currentFilter =
    "all";


/* =========================================================
   Toast
========================================================= */

function showToast(
    message,
    type = "success"
) {

    if (toastTimer) {

        clearTimeout(
            toastTimer
        );
    }


    toast.textContent =
        message;


    toast.className =
        `toast ${type} show`;


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================================================
   حماية الصفحة
========================================================= */

async function protectPage() {

    const {
        data: { session },
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (
        error ||
        !session
    ) {

        window.location.href =
            "index.html";

        return false;
    }


    currentUser =
        session.user;


    const profileLoaded =
        await loadCurrentProfile();


    if (!profileLoaded) {

        showToast(
            "تعذر تحميل بيانات المستخدم",
            "error"
        );


        setTimeout(
            async function () {

                await supabaseClient
                    .auth
                    .signOut();


                window.location.href =
                    "index.html";

            },
            1500
        );


        return false;
    }


    return true;
}


/* =========================================================
   تحميل بيانات المستخدم
========================================================= */

async function loadCurrentProfile() {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("profiles")

            .select(
                "username, role"
            )

            .eq(
                "id",
                currentUser.id
            )

            .single();


    if (error) {

        console.error(
            "Profile Error:",
            error
        );

        return false;
    }


    currentProfile =
        data;


    const roleText =
        currentProfile.role ===
        "admin"
            ? "مدير"
            : "عضو";


    userEmailElement.textContent =
        `${currentProfile.username} - ${roleText}`;


    return true;
}


/* =========================================================
   تشغيل التطبيق
========================================================= */

async function startApplication() {

    const allowed =
        await protectPage();


    if (!allowed) {
        return;
    }


    await loadGuests();
}


startApplication();


/* =========================================================
   تسجيل الخروج
========================================================= */

logoutBtn.addEventListener(
    "click",
    async function () {

        const {
            error
        } =
            await supabaseClient
                .auth
                .signOut();


        if (error) {

            showToast(
                "حدث خطأ أثناء تسجيل الخروج",
                "error"
            );

            return;
        }


        window.location.href =
            "index.html";
    }
);


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


    /* العضو يرى مدعويه فقط */

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
            <p
                style="
                    text-align:center;
                    color:red;
                    padding:20px;
                "
            >
                تعذر تحميل البيانات
            </p>
        `;


        showToast(
            "تعذر تحميل قائمة المدعوين",
            "error"
        );


        return;
    }


    guests =
        data || [];


    updateStats();


    applyGuestFilter();
}


/* =========================================================
   توحيد الاسم
========================================================= */

function normalizeName(name) {

    return name
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}


/* =========================================================
   منع تكرار الاسم
========================================================= */

function guestNameExists(
    name,
    ignoredId = null
) {

    const normalizedName =
        normalizeName(
            name
        );


    return guests.some(
        function (guest) {

            if (
                ignoredId !== null &&
                guest.id === ignoredId
            ) {

                return false;
            }


            return normalizeName(
                guest.name
            ) === normalizedName;
        }
    );
}


/* =========================================================
   تطبيق الفلتر الحالي
========================================================= */

function applyGuestFilter() {

    const searchText =
        normalizeName(
            searchGuestInput.value
        );


    let filteredGuests =
        guests;


    /*
        فلترة حسب الحالة
    */

    if (
        currentFilter ===
        "invited"
    ) {

        filteredGuests =
            filteredGuests.filter(
                function (guest) {

                    return guest.status ===
                        "invited";
                }
            );

    } else if (
        currentFilter ===
        "not-invited"
    ) {

        filteredGuests =
            filteredGuests.filter(
                function (guest) {

                    return guest.status ===
                        "not-invited";
                }
            );
    }


    /*
        البحث يعمل داخل الفلتر الحالي
    */

    if (searchText) {

        filteredGuests =
            filteredGuests.filter(
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
        filteredGuests
    );


    updateActiveFilterCard();
}


/* =========================================================
   تحديد البطاقة النشطة
========================================================= */

function updateActiveFilterCard() {

    totalCard.classList.remove(
        "active-filter"
    );

    invitedCard.classList.remove(
        "active-filter"
    );

    notInvitedCard.classList.remove(
        "active-filter"
    );


    if (
        currentFilter ===
        "all"
    ) {

        totalCard.classList.add(
            "active-filter"
        );


        currentFilterText.textContent =
            "عرض جميع المدعوين";

    } else if (
        currentFilter ===
        "invited"
    ) {

        invitedCard.classList.add(
            "active-filter"
        );


        currentFilterText.textContent =
            "عرض من تمت دعوتهم فقط";

    } else {

        notInvitedCard.classList.add(
            "active-filter"
        );


        currentFilterText.textContent =
            "عرض من لم تتم دعوتهم فقط";
    }
}


/* =========================================================
   أحداث بطاقات الإحصائيات
========================================================= */

totalCard.addEventListener(
    "click",
    function () {

        currentFilter =
            "all";


        applyGuestFilter();


        showToast(
            "تم عرض جميع المدعوين",
            "info"
        );


        scrollToGuestList();
    }
);


invitedCard.addEventListener(
    "click",
    function () {

        currentFilter =
            "invited";


        applyGuestFilter();


        showToast(
            "عرض من تمت دعوتهم",
            "success"
        );


        scrollToGuestList();
    }
);


notInvitedCard.addEventListener(
    "click",
    function () {

        currentFilter =
            "not-invited";


        applyGuestFilter();


        showToast(
            "عرض من لم تتم دعوتهم",
            "info"
        );


        scrollToGuestList();
    }
);


/* =========================================================
   النزول إلى قائمة المدعوين
========================================================= */

function scrollToGuestList() {

    document
        .querySelector(
            ".guest-list"
        )
        .scrollIntoView({
            behavior:
                "smooth",

            block:
                "start"
        });
}


/* =========================================================
   إضافة مدعو
========================================================= */

addGuestBtn.addEventListener(
    "click",
    async function () {

        const name =
            guestNameInput
                .value
                .trim()
                .replace(
                    /\s+/g,
                    " "
                );


        const count =
            parseInt(
                guestCountInput.value
            );


        const status =
            guestStatusInput.value;


        if (!name) {

            showToast(
                "يرجى إدخال اسم المدعو",
                "warning"
            );


            guestNameInput.focus();

            return;
        }


        if (
            !count ||
            count < 1
        ) {

            showToast(
                "يرجى إدخال عدد صحيح للأشخاص",
                "warning"
            );


            guestCountInput.focus();

            return;
        }


        if (
            guestNameExists(
                name
            )
        ) {

            showToast(
                "هذا المدعو موجود سابقًا",
                "warning"
            );


            guestNameInput.focus();

            return;
        }


        addGuestBtn.disabled =
            true;


        addGuestBtn.textContent =
            "جاري الإضافة...";


        const {
            error
        } =
            await supabaseClient

                .from("guests")

                .insert([
                    {
                        name:
                            name,

                        guest_count:
                            count,

                        status:
                            status,

                        created_by:
                            currentUser.id
                    }
                ]);


        addGuestBtn.disabled =
            false;


        addGuestBtn.textContent =
            "إضافة المدعو";


        if (error) {

            console.error(
                "Insert error:",
                error
            );


            if (
                error.code ===
                "23505"
            ) {

                showToast(
                    "هذا المدعو موجود سابقًا",
                    "warning"
                );

            } else {

                showToast(
                    "حدث خطأ أثناء إضافة المدعو",
                    "error"
                );

            }


            return;
        }


        clearForm();


        await loadGuests();


        showToast(
            "تم إضافة المدعو بنجاح",
            "success"
        );
    }
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

        let emptyMessage =
            "لا يوجد مدعوون";


        if (
            currentFilter ===
            "invited"
        ) {

            emptyMessage =
                "لا يوجد مدعوون تمت دعوتهم";

        } else if (
            currentFilter ===
            "not-invited"
        ) {

            emptyMessage =
                "لا يوجد مدعوون لم تتم دعوتهم";
        }


        guestsContainer.innerHTML = `
            <p
                style="
                    text-align:center;
                    padding:30px;
                    color:#6b7280;
                "
            >
                ${emptyMessage}
            </p>
        `;

        return;
    }


    list.forEach(
        function (guest) {

            const guestDiv =
                document.createElement(
                    "div"
                );


            guestDiv.classList.add(
                "guest-item"
            );


            const statusText =
                guest.status ===
                "invited"
                    ? "تمت دعوته"
                    : "لم تتم دعوته";


            const statusClass =
                guest.status ===
                "invited"
                    ? "status-invited"
                    : "status-not-invited";


            const addedByHtml =
                currentProfile.role ===
                "admin"

                    ? `
                        <p class="added-by">
                            أضافه:
                            <strong>
                                ${
                                    guest.profiles
                                        ?.username
                                    ||
                                    "غير معروف"
                                }
                            </strong>
                        </p>
                    `

                    : "";


            const deleteButton =
                currentProfile.role ===
                "admin"

                    ? `
                        <button
                            class="delete-btn"
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


            guestDiv.innerHTML = `

                <h3>
                    ${escapeHtml(
                        guest.name
                    )}
                </h3>

                <p>
                    عدد الأشخاص:

                    <strong>
                        ${guest.guest_count}
                    </strong>
                </p>

                ${addedByHtml}

                <p
                    class="${statusClass}"
                >
                    الحالة:

                    ${statusText}
                </p>

                <div
                    class="guest-actions"
                >

                    <button
                        class="edit-name-btn"
                        onclick="
                            editGuestName(
                                ${guest.id}
                            )
                        "
                    >
                        تعديل الاسم
                    </button>

                    <button
                        class="edit-btn"
                        onclick="
                            toggleGuestStatus(
                                ${guest.id}
                            )
                        "
                    >
                        تغيير الحالة
                    </button>

                    ${deleteButton}

                </div>
            `;


            guestsContainer.appendChild(
                guestDiv
            );
        }
    );
}


/* =========================================================
   فتح تعديل الاسم
========================================================= */

function editGuestName(id) {

    const guest =
        guests.find(
            function (item) {

                return item.id === id;
            }
        );


    if (!guest) {

        showToast(
            "تعذر العثور على المدعو",
            "error"
        );

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
   إغلاق نافذة التعديل
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


/* =========================================================
   إلغاء
========================================================= */

cancelEditNameBtn.addEventListener(
    "click",
    function () {

        closeEditModal();
    }
);


/* =========================================================
   حفظ تعديل الاسم
========================================================= */

saveGuestNameBtn.addEventListener(
    "click",
    saveEditedGuestName
);


async function saveEditedGuestName() {

    if (
        editingGuestId === null
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

        showToast(
            "تعذر العثور على المدعو",
            "error"
        );

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
            "يرجى إدخال اسم المدعو",
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

        showToast(
            "لم يتم إجراء أي تغيير على الاسم",
            "info"
        );


        closeEditModal();

        return;
    }


    if (
        guestNameExists(
            newName,
            editingGuestId
        )
    ) {

        showToast(
            "يوجد مدعو آخر بهذا الاسم مسبقًا",
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
                "يوجد مدعو آخر بهذا الاسم مسبقًا",
                "warning"
            );

        } else {

            showToast(
                "حدث خطأ أثناء تعديل الاسم",
                "error"
            );

        }


        return;
    }


    closeEditModal();


    await loadGuests();


    showToast(
        "تم تعديل اسم المدعو بنجاح",
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

            saveEditedGuestName();
        }


        if (
            event.key ===
            "Escape"
        ) {

            closeEditModal();
        }
    }
);


/* =========================================================
   الضغط خارج النافذة
========================================================= */

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

        showToast(
            "تعذر العثور على المدعو",
            "error"
        );

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
            "حدث خطأ أثناء تغيير الحالة",
            "error"
        );

        return;
    }


    await loadGuests();


    if (
        newStatus ===
        "invited"
    ) {

        showToast(
            "تم تحديد المدعو كـ تمت دعوته",
            "success"
        );

    } else {

        showToast(
            "تم تحديد المدعو كـ لم تتم دعوته",
            "info"
        );

    }
}


/* =========================================================
   حذف المدعو
========================================================= */

async function deleteGuest(id) {

    if (
        currentProfile.role !==
        "admin"
    ) {

        showToast(
            "ليس لديك صلاحية حذف المدعوين",
            "error"
        );

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
            `هل أنت متأكد من حذف المدعو "${guest.name}"؟`
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

        showToast(
            "حدث خطأ أثناء حذف المدعو",
            "error"
        );

        return;
    }


    await loadGuests();


    showToast(
        "تم حذف المدعو بنجاح",
        "success"
    );
}


/* =========================================================
   البحث
========================================================= */

searchGuestInput.addEventListener(
    "input",
    function () {

        applyGuestFilter();
    }
);


/* =========================================================
   الإحصائيات
========================================================= */

function updateStats() {

    totalGuestsElement.textContent =
        guests.length;


    invitedGuestsElement.textContent =
        guests.filter(
            function (guest) {

                return guest.status ===
                    "invited";
            }
        ).length;


    notInvitedGuestsElement.textContent =
        guests.filter(
            function (guest) {

                return guest.status ===
                    "not-invited";
            }
        ).length;
}


/* =========================================================
   تنظيف النموذج
========================================================= */

function clearForm() {

    guestNameInput.value =
        "";


    guestCountInput.value =
        1;


    guestStatusInput.value =
        "not-invited";


    guestNameInput.focus();
}


/* =========================================================
   حماية HTML
========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;
}


/* =========================================================
   Enter لإضافة المدعو
========================================================= */

guestNameInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            addGuestBtn.click();
        }
    }
);