const membersContainer =
    document.getElementById(
        "membersContainer"
    );


startMembersPage();


async function startMembersPage() {

    const ready =
        await initializeUser();


    if (!ready) {
        return;
    }


    if (
        currentProfile.role !==
        "admin"
    ) {

        window.location.href =
            "home.html";

        return;
    }


    await loadMembersReport();
}


/* =========================================================
   تحميل المستخدمين والمدعوين
========================================================= */

async function loadMembersReport() {

    const {
        data: profiles,
        error: profilesError
    } =
        await supabaseClient

            .from("profiles")

            .select(
                "id, username, role"
            )

            .order(
                "username",
                {
                    ascending: true
                }
            );


    if (profilesError) {

        console.error(
            "Profiles Error:",
            profilesError
        );


        showToast(
            "تعذر تحميل المستخدمين",
            "error"
        );

        return;
    }


    const {
        data: guests,
        error: guestsError
    } =
        await supabaseClient

            .from("guests")

            .select(`
                id,
                name,
                guest_count,
                status,
                created_by,
                created_at
            `)

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (guestsError) {

        console.error(
            "Guests Error:",
            guestsError
        );


        showToast(
            "تعذر تحميل المدعوين",
            "error"
        );

        return;
    }


    renderReports(
        profiles || [],
        guests || []
    );
}


/* =========================================================
   عرض تقرير المدير والأعضاء
========================================================= */

function renderReports(
    profiles,
    guests
) {

    membersContainer.innerHTML =
        "";


    /*
        أولاً المدير
    */

    const admins =
        profiles.filter(
            function (profile) {

                return profile.role ===
                    "admin";
            }
        );


    admins.forEach(
        function (admin) {

            const adminGuests =
                guests.filter(
                    function (guest) {

                        return (
                            guest.created_by ===
                            admin.id
                        );
                    }
                );


            createReportCard(
                admin,
                adminGuests,
                true
            );
        }
    );


    /*
        ثم الأعضاء
    */

    const members =
        profiles.filter(
            function (profile) {

                return profile.role ===
                    "member";
            }
        );


    members.forEach(
        function (member) {

            const memberGuests =
                guests.filter(
                    function (guest) {

                        return (
                            guest.created_by ===
                            member.id
                        );
                    }
                );


            createReportCard(
                member,
                memberGuests,
                false
            );
        }
    );


    /*
        السجلات القديمة التي لا يوجد لها created_by
    */

    renderUnknownGuests(
        guests
    );
}


/* =========================================================
   إنشاء بطاقة تقرير
========================================================= */

function createReportCard(
    profile,
    profileGuests,
    isAdmin
) {

    const totalRecords =
        profileGuests.length;


    const invited =
        profileGuests.filter(
            function (guest) {

                return guest.status ===
                    "invited";
            }
        ).length;


    const notInvited =
        profileGuests.filter(
            function (guest) {

                return guest.status ===
                    "not-invited";
            }
        ).length;


    const totalPeople =
        profileGuests.reduce(
            function (
                total,
                guest
            ) {

                return (
                    total +
                    (
                        Number(
                            guest.guest_count
                        ) || 0
                    )
                );
            },
            0
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        isAdmin
            ? "member-report-card admin-report-card"
            : "member-report-card";


    const titleText =
        isAdmin
            ? `المدير - ${escapeHtml(
                profile.username
            )}`
            : escapeHtml(
                profile.username
            );


    const avatarText =
        isAdmin
            ? "⭐"
            : "👤";


    card.innerHTML = `

        <button
            class="member-report-header"
            type="button"
            onclick="
                toggleMemberReport(
                    '${profile.id}'
                )
            "
        >

            <div class="member-report-user">

                <div class="member-avatar">
                    ${avatarText}
                </div>

                <div>

                    <h3>
                        ${titleText}
                    </h3>

                    <span>
                        ${totalRecords}
                        مدعو
                    </span>

                </div>

            </div>


            <span
                id="arrow-${profile.id}"
                class="member-arrow"
            >
                ‹
            </span>

        </button>


        <div class="member-report-stats">

            <div>
                <span>
                    الأسماء
                </span>

                <strong>
                    ${totalRecords}
                </strong>
            </div>


            <div>
                <span>
                    تمت دعوتهم
                </span>

                <strong class="green-number">
                    ${invited}
                </strong>
            </div>


            <div>
                <span>
                    لم تتم دعوتهم
                </span>

                <strong class="red-number">
                    ${notInvited}
                </strong>
            </div>


            <div>
                <span>
                    الأشخاص
                </span>

                <strong>
                    ${totalPeople}
                </strong>
            </div>

        </div>


        <div
            id="member-${profile.id}"
            class="member-guests-list"
        >

            ${buildGuestList(
                profileGuests
            )}

        </div>
    `;


    membersContainer.appendChild(
        card
    );
}


/* =========================================================
   قائمة أسماء مدعوي المستخدم
========================================================= */

function buildGuestList(
    profileGuests
) {

    if (
        profileGuests.length === 0
    ) {

        return `
            <div class="member-no-guests">
                لم تتم إضافة أي مدعو حتى الآن
            </div>
        `;
    }


    return profileGuests
        .map(
            function (guest) {

                const invited =
                    guest.status ===
                    "invited";


                return `

                    <div class="member-guest-row">

                        <div>

                            <strong class="member-guest-name">
                                ${escapeHtml(
                                    guest.name
                                )}
                            </strong>

                            <span class="member-guest-count">
                                ${guest.guest_count}
                                شخص
                            </span>

                        </div>


                        <span
                            class="
                                member-guest-status
                                ${
                                    invited
                                        ? "invited"
                                        : "pending"
                                }
                            "
                        >

                            ${
                                invited
                                    ? "تمت دعوته"
                                    : "لم تتم دعوته"
                            }

                        </span>

                    </div>
                `;
            }
        )
        .join("");
}


/* =========================================================
   فتح وإغلاق التقرير
========================================================= */

function toggleMemberReport(
    memberId
) {

    const list =
        document.getElementById(
            `member-${memberId}`
        );


    const arrow =
        document.getElementById(
            `arrow-${memberId}`
        );


    if (!list) {
        return;
    }


    const opened =
        list.classList.toggle(
            "show"
        );


    if (arrow) {

        arrow.classList.toggle(
            "open",
            opened
        );
    }
}


/* =========================================================
   سجلات قديمة بلا created_by
========================================================= */

function renderUnknownGuests(
    guests
) {

    const unknownGuests =
        guests.filter(
            function (guest) {

                return !guest.created_by;
            }
        );


    if (
        unknownGuests.length === 0
    ) {

        return;
    }


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "member-report-card unknown-report";


    card.innerHTML = `

        <button
            class="member-report-header"
            type="button"
            onclick="
                toggleMemberReport(
                    'unknown'
                )
            "
        >

            <div class="member-report-user">

                <div class="member-avatar">
                    ?
                </div>

                <div>

                    <h3>
                        سجلات قديمة
                    </h3>

                    <span>
                        غير منسوبة إلى مستخدم
                    </span>

                </div>

            </div>


            <span
                id="arrow-unknown"
                class="member-arrow"
            >
                ‹
            </span>

        </button>


        <div
            id="member-unknown"
            class="member-guests-list"
        >

            ${buildGuestList(
                unknownGuests
            )}

        </div>
    `;


    membersContainer.appendChild(
        card
    );
}