const apiUrlStatus = "https://status-api.m64.dev/status/get";
const apiUrlContact = "https://status-api.m64.dev/contact/webhook";

const outputElement = document.getElementById("online-status");
let tooltipElement = document.getElementById("online-tooltip");
const onlineTooltip =
  '<span id="online-tooltip">This is my current online status on Discord</span>';

document.addEventListener("mousemove", changeTooltipLocation);
window.setTimeout(fetchOnlineStatus, 2000); // Show first after 2 seconds
window.setInterval(fetchOnlineStatus, 10000); // Update status every 10 seconds

function fetchOnlineStatus() {
    fetch(apiUrlStatus)
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
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const contactForm = document.getElementById("contact-form");
    const contactSubmit = document.getElementById("contact-submit");

    const modal = document.getElementById("contact-modal");
    const modalTitle = document.getElementById("contact-modal-title");
    const modalText = document.getElementById("contact-modal-text");
    const modalClose = document.getElementById("contact-modal-close");

    try {
        contactSubmit.innerText = "Sending..."
        const response = await fetch(apiUrlContact, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        modalClose.style.transition = "0.25s";
        modal.style.visibility = "visible";

        if (response.ok) {
            modalTitle.innerHTML = "<i class=\"fa-solid fa-check\"></i> Successfully sent";
            modalText.innerText = "Your message has been delivered by my magical pigeon. I'll get in touch as soon as possible!";

            contactForm.reset();
        } else {
            const body = await response.json();

            if (response.status === 429) {
                modalTitle.innerHTML = "<i class=\"fa-solid fa-circle-exclamation\"></i> Too faaasstttt!";
                modalText.innerText = "You've sent too many request already, please try again later.";
            } else if (response.status === 403 && body.error === "turnstile_failed") {
                modalTitle.innerHTML = "<i class=\"fa-solid fa-circle-exclamation\"></i> You are a robot?!";
                modalText.innerText = "Please verify your humanity before submitting this form.";
            } else {
                modalTitle.innerHTML = "<i class=\"fa-solid fa-x\"></i> An error occurred!";
                modalText.innerText = "Something went wrong... Please try again later!";
            }
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



/*
 * Scramble animation on load
 */
document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".scramble");
    elements.forEach((element) => scrambleText(element, 800));

    function scrambleText(element, duration) {
        const originalHtml = element.innerHTML; // Store original HTML to restore later
        const textNodes = getTextNodes(element);

        let iteration = 0;
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        function update() {
            let scrambledHtml = originalHtml;

            // Scramble text nodes
            textNodes.forEach((node) => {
                const originalText = node.textContent;
                const scrambledText = originalText
                    .split("")
                    .map((char, i) => {
                        if (char === " ") return char; // Preserve spaces
                        if (iteration >= (duration / 60 / originalText.length) * i)
                            return char; // Reveal original characters progressively
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join("");

                scrambledHtml = scrambledHtml.replace(
                    originalText,
                    scrambledText,
                );
            });

            element.innerHTML = scrambledHtml;

            iteration++;

            if (iteration < duration / 60) {
                setTimeout(update, 60);
            } else {
                element.innerHTML = originalHtml;
            }
        }

        update();
    }

    // Helper function to get all text nodes within an element
    function getTextNodes(element) {
        const textNodes = [];

        function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                node.childNodes.forEach(walk);
            }
        }

        walk(element);
        return textNodes;
    }
});

window.scrollToElement = scrollToElement;
window.copyEmail = copyEmail;
window.closeContactModal = closeContactModal;
window.scrambleText = scrambleText;