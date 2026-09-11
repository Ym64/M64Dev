const api_url = "https://status-api.m64.dev";
// const api_url = "http://0.0.0.0:8080";

const outputElement = document.getElementById("online-status");
let tooltipElement = document.getElementById("online-tooltip");
const onlineTooltip =
  '<span id="online-tooltip">This is my current online status on Discord</span>';

document.addEventListener("mousemove", changeTooltipLocation);
window.setTimeout(fetchOnlineStatus, 2000); // Show first after 2 seconds
window.setInterval(fetchOnlineStatus, 10000); // Update status every 10 seconds

function fetchOnlineStatus() {
  const apiUrl = `${api_url}/status/get`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        outputElement.classList.remove("offline", "online", "dnd", "idle");
        outputElement.innerHTML = "Couldn't load status";
        outputElement.classList.add("offline");
      }
      return response.json();
    })
    .then((data) => {
      const status = Number(data.status);

      // Remove all status classes
      outputElement.classList.remove("offline", "online", "dnd", "idle");

      // Add class based on status
      switch (status) {
        case 1: // ONLINE
          outputElement.classList.add("online");
          outputElement.innerHTML = "Online" + onlineTooltip;
          break;
        case 2: // DO_NOT_DISTURB
          outputElement.classList.add("dnd");
          outputElement.innerHTML = "Do not disturb" + onlineTooltip;
          break;
        case 3: // IDLE
          outputElement.classList.add("idle");
          outputElement.innerHTML = "Idle" + onlineTooltip;
          break;
        default:
          outputElement.classList.add("offline");
          outputElement.innerHTML = "Offline" + onlineTooltip;
          break;
      }

      tooltipElement = document.getElementById("online-tooltip");
    })
    .catch((error) => {
      console.error("Error fetching status:", error);
      outputElement.classList.remove("offline", "online", "dnd", "idle");
      outputElement.innerHTML = "Couldn't load status";
      outputElement.classList.add("offline");
    });
}

function changeTooltipLocation(e) {
  if (tooltipElement == null) {
    return;
  }
  tooltipElement.style.left = e.pageX - tooltipElement.offsetWidth / 2 + "px";
  tooltipElement.style.top = e.pageY - tooltipElement.offsetHeight * 1.2 + "px";
}

/*
 * SMOOTH SCROLL
 */
// Initialize Lenis
const lenis = new Lenis({
  autoRaf: true,
});

function scrollToElement(elementId) {
  lenis.scrollTo(document.getElementById(elementId), {offset: -60});
}

/*
 * Contact stuff
 */
function copyEmail(element) {
    if (element.classList.contains("copied")) return;
    const email = "me@ymanu.dev";
    const innerHtML = element.innerHTML;
    navigator.clipboard.writeText(email).then(() => {
        element.classList.add("copied");
        element.innerHTML = "<i class=\"fa-solid fa-check\"></i> Email Copied";

        setTimeout(() => {
            element.classList.remove("copied");
            element.innerHTML = innerHtML;
          }, 1700);
    });
}

function setRemainingChars(element, spanId, maxChars) {
    document.getElementById(spanId).innerText = (maxChars - element.value.length).toString();
}

document.getElementById("contact-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const turnstileToken = document.querySelector(
        '[name="cf-turnstile-response"]'
    )?.value;

    const data = {
        name: form.name.value,
        email: form.email.value,
        discord: form.discord.value || null,
        message: form.message.value,
        turnstileToken
    };

    console.log(data);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const contactForm = document.getElementById("contact-form");
    const contactSubmit = document.getElementById("contact-submit");

    const modal = document.getElementById("contact-modal");
    const modalTitle = document.getElementById("contact-modal-title");
    const modalText = document.getElementById("contact-modal-text");
    const modalClose = document.getElementById("contact-modal-close");

    try {
        contactSubmit.innerText = "Sending..."
        const response = await fetch(`${api_url}/contact/webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        modalClose.style.transition = "0.25s";

        if (response.ok) {
            modal.style.visibility = "visible";
            modalTitle.innerHTML = "<i class=\"fa-solid fa-check\"></i> Successfully sent";
            modalText.innerText = "Your message has been delivered by my magical pigeon. I'll get in touch as soon as possible!";

            contactForm.reset();
        } else if (response.status === 429) {
            modal.style.visibility = "visible";
            modalTitle.innerHTML = "<i class=\"fa-solid fa-circle-exclamation\"></i> Too faaasstttt!";
            modalText.innerText = "You've sent too many request already, please try again later.";
        } else {
            modal.style.visibility = "visible";
            modalTitle.innerHTML = "<i class=\"fa-solid fa-x\"></i> An error occurred!";
            modalText.innerText = "Something went wrong... Please try again later!";
        }

    } catch (e) {
        clearTimeout(timeoutId);

        modal.style.visibility = "visible";
        modalTitle.innerHTML = "<i class=\"fa-solid fa-x\"></i> An error occurred!";
        modalText.innerText = "Something went wrong... Please try again later!";

        console.error("Fetch error: " + e);
    } finally {
        contactSubmit.innerText = "Submit";
    }
});

function closeContactModal(button) {
    const modal = document.getElementById("contact-modal");
    modal.style.visibility = "hidden";
    button.style.transition = "0s";
}