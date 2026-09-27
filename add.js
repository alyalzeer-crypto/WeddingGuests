const guestNameInput =
    document.getElementById("guestName");

const guestCountInput =
    document.getElementById("guestCount");

const guestStatusInput =
    document.getElementById("guestStatus");

const addGuestBtn =
    document.getElementById("addGuestBtn");


startAddPage();


async function startAddPage() {

    const ready =
        await initializeUser();


    if (!ready) {

        return;
    }


    guestNameInput.focus();
}


/* =========================================================
   إضافة مدعو
========================================================= */

addGuestBtn.addEventListener(
    "click",
    addGuest
);


async function addGuest() {

    const name =
        guestNameInput
            .value
            .trim()
            .replace(
                /\s+/g,
                " "
            );


    const guestCount =
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
        !guestCount ||
        guestCount < 1
    ) {

        showToast(
            "يرجى إدخال عدد صحيح للأشخاص",
            "warning"
        );


        guestCountInput.focus();

        return;
    }


    /*
        نتحقق من تكرار الاسم من قاعدة البيانات
        وليس فقط من القائمة الحالية.
    */

    const {
        data: existingGuests,
        error: checkError
    } =
        await supabaseClient

            .from("guests")

            .select(
                "id, name"
            );


    if (checkError) {

        console.error(
            "Check guest error:",
            checkError
        );


        showToast(
            "تعذر التحقق من الاسم",
            "error"
        );

        return;
    }


    const duplicate =
        (existingGuests || []).some(
            function (guest) {

                return normalizeName(
                    guest.name
                ) ===
                normalizeName(
                    name
                );
            }
        );


    if (duplicate) {

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
                        guestCount,

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
            "Insert guest error:",
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


    clearAddForm();


    showToast(
        "تم إضافة المدعو بنجاح",
        "success"
    );
}


/* =========================================================
   تنظيف النموذج
========================================================= */

function clearAddForm() {

    guestNameInput.value =
        "";


    guestCountInput.value =
        1;


    guestStatusInput.value =
        "not-invited";


    guestNameInput.focus();
}


/* =========================================================
   Enter للإضافة
========================================================= */

guestNameInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            addGuest();
        }
    }
);


guestCountInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Enter"
        ) {

            addGuest();
        }
    }
);