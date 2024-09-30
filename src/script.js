import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD51T-VWi0Bu7EFL9sBK6m1D3YKAbXZIjA",
  authDomain: "pendidikan-yisc.firebaseapp.com",
  projectId: "pendidikan-yisc",
  storageBucket: "pendidikan-yisc.appspot.com",
  messagingSenderId: "925770161526",
  appId: "1:925770161526:web:5adb6ec56562226934ee57",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Reference to the collection
const colRef = collection(db, "contributions");

document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetch("../dist/json/dates.json").then((response) => response.json()),
    fetch("../dist/json/pic.json").then((response) => response.json()),
  ]).then(([datesData, picData]) => {
    // Map the 'dateOfPendidikan' values to Date objects
    const dates = datesData.dates.map((entry) => ({
      date: new Date(entry.dateOfPendidikan),
      events: entry.events,
    }));

    let currentDate = new Date();
    let currentIndex = dates.findIndex(
      (entry) => entry.date.toDateString() === currentDate.toDateString()
    );

    const picAssignments = picData.pic;

    // Set the current date to the closest predefined date if today's date is not in the list
    if (currentIndex === -1) {
      const nextClosestDate = dates.find((entry) => entry.date > currentDate);
      if (nextClosestDate) {
        currentIndex = dates.indexOf(nextClosestDate);
      } else {
        currentIndex = dates.length - 1; // If no future dates, default to the last date
      }
    }

    const getNearestSunday = (date) => {
      const dayOfWeek = date.getDay();
      const distanceToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      const nearestSunday = new Date(date);
      nearestSunday.setDate(date.getDate() + distanceToSunday);
      return nearestSunday;
    };

    const formatDateInIndonesian = (date) => {
      const days = [
        "Ahad",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      const day = days[date.getDay()];
      const month = months[date.getMonth()];
      return `${day}, ${date.getDate()} ${month} ${date.getFullYear()}`;
    };

    const updateDateDisplay = () => {
      const displayedDate = dates[currentIndex].date;
      const header = document.getElementById("header");
      const dateDisplay = document.getElementById("dateDisplay");
      const paraTitle = document.getElementById("para-title");
      const navHeader = document.getElementById("nav");
      const paraKOns = document.getElementById("para-kons");
      const nearestSunday = getNearestSunday(currentDate);
      const main = document.querySelector("main");
      main.innerHTML = ""; // Clear the previous events

      // Display the formatted date
      dateDisplay.textContent = formatDateInIndonesian(displayedDate);

      // Initialize total lunch counter
      let totalLunchCount = 0;
      // To store unique contName values
      const uniqueNames = new Set();

      // Update styles based on the nearest Sunday logic
      if (displayedDate.toDateString() === nearestSunday.toDateString()) {
        header.className =
          "w-full max-w-screen-xs px-4 fixed left-1/2 -translate-x-1/2 top-0 z-10 bg-sky-200";
        paraTitle.className = "pt-8 text-center rounded-t-2xl text-sky-700";
        navHeader.className = "pt-2 flex justify-between text-gray-950";
        dateDisplay.className = "text-2xl font-bold text-gray-950";
        paraKOns.className = "pt-1 pb-8 text-center text-sky-700 rounded-b-2xl";
        main.className =
          "w-full max-w-screen-xs mx-auto mt-52px px-4 pb-88px pt-24 flex flex-col gap-4 bg-sky-200 min-h-screen";
      } else if (displayedDate > nearestSunday) {
        header.className =
          "w-full max-w-screen-xs px-4 fixed left-1/2 -translate-x-1/2 top-0 z-10 bg-sky-200";
        paraTitle.className = "pt-8 text-center rounded-t-2xl text-sky-700";
        navHeader.className = "pt-2 flex justify-between text-gray-950";
        dateDisplay.className = "text-2xl font-bold text-gray-950";
        paraKOns.className = "pt-1 pb-8 text-center text-sky-700 rounded-b-2xl";
        main.className =
          "w-full max-w-screen-xs mx-auto mt-52px px-4 pb-88px pt-24 flex flex-col gap-4 bg-sky-200 min-h-screen";
      } else {
        header.className =
          "w-full max-w-screen-xs px-4 fixed left-1/2 -translate-x-1/2 top-0 z-10 bg-gray-200";
        paraTitle.className = "pt-8 text-center rounded-t-2xl text-gray-400";
        navHeader.className = "pt-2 flex justify-between text-gray-400";
        dateDisplay.className = "text-2xl font-bold text-gray-400";
        paraKOns.className =
          "pt-1 pb-8 text-center text-gray-400 rounded-b-2xl";
        main.className =
          "w-full max-w-screen-xs mx-auto mt-52px px-4 pb-88px pt-24 flex flex-col gap-4 bg-gray-200 min-h-screen";
      }

      const events = dates[currentIndex].events;

      // Populate events
      Object.entries(events).forEach(
        ([key, [eventTitle, eventType, sectionId, eventTime]]) => {
          const section = document.createElement("section");
          section.id = sectionId;
          section.classList = "pb-5 bg-white rounded-2xl";

          const div = document.createElement("div");

          if (displayedDate.toDateString() === nearestSunday.toDateString()) {
            div.className = `sticky top-148px bg-sky-200 rounded-b-2xl`;
          } else if (displayedDate > nearestSunday) {
            div.className = `sticky top-148px bg-sky-200 rounded-b-2xl`;
          } else {
            div.className = `sticky top-148px bg-gray-200 rounded-b-2xl`;
          }

          const divWrapper = document.createElement("div");
          divWrapper.className = `flex bg-white rounded-t-2xl`;

          const h2 = document.createElement("h2");
          h2.className = `py-4 ml-4 flex-grow flex flex-row gap-1.5 items-center font-semibold bg-white text-xl text-gray-950 rounded-tl-2xl border-b border-b-gray-300`;

          // Create the image and span
          const span = document.createElement("span");
          span.textContent = eventTitle;

          if (eventType === "via-zoom") {
            // Create an SVG element
            const svg = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "svg"
            );
            svg.setAttribute("width", "24"); // Set width as needed
            svg.setAttribute("height", "24"); // Set height as needed
            svg.classList.add("size-6", "fill-gray-950"); // Add necessary classes

            // Define the SVG content here
            svg.innerHTML = `
              <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
            `; // Replace this with your actual SVG markup

            h2.appendChild(svg); // Image as first child inside h2
          }

          h2.appendChild(span); // Append the span after the img

          const p = document.createElement("p");
          p.className =
            "py-4 mr-4 bg-white text-xl text-gray-400 border-b border-b-gray-300 text-right";
          p.textContent = eventTime;

          div.appendChild(divWrapper);
          divWrapper.appendChild(h2);
          divWrapper.appendChild(p);
          section.appendChild(div);

          // Get PICs for the event
          const eventPIC = picAssignments.find(
            (pic) => pic.event === sectionId
          );
          if (eventPIC) {
            Object.values(eventPIC.assignments).forEach(
              ({ picId, type, quota, desc }) => {
                const picDiv = document.createElement("div");
                picDiv.id = `${picId}`;
                picDiv.className =
                  "mx-4 mt-5 pb-5 flex flex-col gap-2 border-b border-b-gray-300 last:border-b-0";
                const picTypeQuota = document.createElement("h3");
                picTypeQuota.className = "text-gray-950 font-bold";
                picTypeQuota.innerHTML = `${type} ${quota}`;
                const nameOl = document.createElement("ol");
                nameOl.className =
                  "flex flex-col gap-2 list-decimal list-inside text-sky-600 underline underline-offset-2 decoration-solid";
                section.appendChild(picDiv);
                picDiv.appendChild(picTypeQuota);
                picDiv.appendChild(nameOl);

                getDocs(colRef)
                  .then((snapshot) => {
                    snapshot.docs.forEach((doc) => {
                      const contDataId = doc.id;
                      const contId = doc.data().contribution_id;
                      const contName = doc.data().name;
                      const contLunch = doc.data().lunch;
                      const contDate = doc.data().contribution_date;
                      const firestoreDate = new Date(
                        contDate.seconds * 1000 + contDate.nanoseconds / 1000000
                      );
                      const localDate = new Date(
                        firestoreDate.toLocaleString("en-US", {
                          timeZone: "Asia/Jakarta",
                        })
                      );
                      const compareDates =
                        localDate.toString() === displayedDate.toString();

                      // previously some, I change to find
                      const contPIC = contId.find(
                        (contribution) => contribution === picId
                      );
                      if (compareDates && contPIC) {
                        const nameLi = document.createElement("li");
                        const linkPerson = document.createElement("a");
                        linkPerson.setAttribute("data-id", `${contDataId}`);
                        linkPerson.setAttribute(
                          "href",
                          `detail.html?id=${contDataId}`
                        );
                        if (contLunch) {
                          linkPerson.innerHTML = `${contName} &nbsp &#127857;`;
                        } else {
                          linkPerson.innerHTML = `${contName} `;
                        }
                        nameLi.appendChild(linkPerson);
                        nameOl.appendChild(nameLi);

                        // Increment the lunch counter if lunch is true
                        if (contLunch && !uniqueNames.has(contName)) {
                          uniqueNames.add(contName);
                          totalLunchCount++;
                        }
                      }
                    });

                    // After processing all the documents, set the total lunch count
                    const totalLunch = document.getElementById("totalLunch");

                    // If no lunch entries are found, make sure to reset the count to 0
                    if (totalLunchCount === 0) {
                      totalLunchCount = 0;
                    }

                    // Update the total lunch count in the UI
                    totalLunch.textContent = `${totalLunchCount} pax`;
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            );
          }

          const buttonBantu = document.createElement("button");
          buttonBantu.className =
            "w-full max-w-screen-xs px-6 fixed left-1/2 -translate-x-1/2 bottom-4 text-white font-bold text-base z-10";
          buttonBantu.id = "scrollButton";

          const paraButtonBantu = document.createElement("p");
          paraButtonBantu.innerHTML = "Bantu Pendidikan";
          paraButtonBantu.className = "w-full p-4 rounded-xl bg-gray-950";

          main.appendChild(section);
          main.appendChild(buttonBantu);
          buttonBantu.appendChild(paraButtonBantu);

          window.addEventListener("scroll", function () {
            const scrollPosition = window.scrollY + window.innerHeight + 56;
            const documentHeight = document.documentElement.scrollHeight;
            console.log(scrollPosition);
            console.log(documentHeight);

            // Check if the user has scrolled to the bottom
            if (scrollPosition >= documentHeight) {
              // Change padding class if at the bottom
              buttonBantu.classList.remove("px-6");
              buttonBantu.classList.add("px-4");
            } else {
              // Revert back to original padding class
              buttonBantu.classList.remove("px-4");
              buttonBantu.classList.add("px-6");
            }
          });

          buttonBantu.addEventListener("click", function () {
            // Redirect to index.html
            window.location.href = "add.html";
          });
        }
      );
    };

    // Previous button click event
    document.getElementById("prevBtn").addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateDateDisplay();
      }
    });

    // Next button click event
    document.getElementById("nextBtn").addEventListener("click", () => {
      if (currentIndex < dates.length - 1) {
        currentIndex++;
        updateDateDisplay();
      }
    });

    // Initial display update
    updateDateDisplay();
  });
});
