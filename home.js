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
   تحميل إحصائيات الرئيسية
========================================================= */

async function loadHomeStats() {

    let query =
        supabaseClient

            .from("guests")

            .select(`
                id,
                status,
                created_by,
                gender
            `);


    /*
        العضو يرى إحصائيات مدعويه فقط.
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


    /* =========================================
       الإجمالي
    ========================================= */

    const total =
        guests.length;


    /* =========================================
       تمت دعوتهم
    ========================================= */

    const invited =
        guests.filter(
            function (guest) {

                return (
                    guest.status ===
                    "invited"
                );
            }
        ).length;


    /* =========================================
       لم تتم دعوتهم
    ========================================= */

    const notInvited =
        guests.filter(
            function (guest) {

                return (
                    guest.status ===
                    "not-invited"
                );
            }
        ).length;


    /* =========================================
       الرجال
    ========================================= */

    const males =
        guests.filter(
            function (guest) {

                return (
                    guest.gender ===
                    "male"
                );
            }
        ).length;


    /* =========================================
       النساء
    ========================================= */

    const females =
        guests.filter(
            function (guest) {

                return (
                    guest.gender ===
                    "female"
                );
            }
        ).length;


    /* =========================================
       عرض الأرقام
    ========================================= */

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


    document
        .getElementById(
            "maleGuests"
        )
        .textContent =
        males;


    document
        .getElementById(
            "femaleGuests"
        )
        .textContent =
        females;


    /* =========================================
       وصف الإحصائيات
    ========================================= */

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