/* =========================================================
   تشغيل الصفحة
========================================================= */

startHomePage();


async function startHomePage() {

    const ready =
        await initializeUser();


    if (!ready) {

        return;
    }


    await loadHomeStats();
}


/* =========================================================
   تحميل الإحصائيات
========================================================= */

async function loadHomeStats() {

    let query =
        supabaseClient

            .from("guests")

            .select(
                "id, status, created_by"
            );


    /*
        العضو يرى إحصائياته فقط
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
            "Stats error:",
            error
        );


        showToast(
            "تعذر تحميل الإحصائيات",
            "error"
        );


        return;
    }


    const guests =
        data || [];


    const total =
        guests.length;


    const invited =
        guests.filter(
            function (guest) {

                return guest.status ===
                    "invited";
            }
        ).length;


    const notInvited =
        guests.filter(
            function (guest) {

                return guest.status ===
                    "not-invited";
            }
        ).length;


    document
        .getElementById(
            "totalGuests"
        )
        .textContent =
        total;


    document
        .getElementById(
            "invitedGuests"
        )
        .textContent =
        invited;


    document
        .getElementById(
            "notInvitedGuests"
        )
        .textContent =
        notInvited;


    const description =
        document.getElementById(
            "statsDescription"
        );


    if (
        currentProfile.role ===
        "admin"
    ) {

        description.textContent =
            "إحصائيات جميع المدعوين";

    } else {

        description.textContent =
            "إحصائيات المدعوين الذين أضفتهم";
    }
}