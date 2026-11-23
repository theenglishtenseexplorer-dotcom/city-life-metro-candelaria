
function updateAvatarPreview() {
  const avatar = $("avatar-preview");

  // Create the actual character parts
  avatar.innerHTML = `
    <div class="avatar-hair"></div>
    <div class="avatar-face">
      <span class="eyes">••</span>
      <span class="mouth"></span>
    </div>
    <div class="avatar-neck"></div>
    <div class="avatar-body"></div>
  `;

  // Apply the selected appearance
  avatar.className = `avatar avatar-medium ${
    $("skin-tone").value
  } ${
    $("hair-color").value
  } ${
    $("outfit").value
  } ${
    $("hair-style").value
  }`;

  $("preview-name").textContent =
    $("player-name").value.trim() || "Your character";

  $("preview-meta").textContent =
    `${$("player-gender").value} · ${
      $("player-background").value === "Custom"
        ? "Your own background"
        : $("player-background").value
    }`;
}
