document.getElementById('aProfile').addEventListener('click', function(){
    const dropDown = document.getElementById('dropOpt');

    if (dropDown.style.display === 'block') {
        dropDown.style.display = 'none';
      } else {
        dropDown.style.display = 'block';
      }

           // Highlight the profile link when it's clicked
     document.querySelectorAll('#linkNav a').forEach(link => {
      link.classList.remove('active');
    });
    this.classList.add('active');
});

document.addEventListener('click', function(event) {
    var isClickInside = document.getElementById('navMobile').contains(event.target);
    if (!isClickInside) {
      document.getElementById('dropOpt').style.display = 'none';
      document.getElementById('aProfile').classList.remove('active');
      window.addEventListener('click', setActiveLink);

    }
  });

  function setActiveLink() {
    // Remove the 'active' class from all links
    document.querySelectorAll('#linkNav a').forEach(link => {
      link.classList.remove('active');

    });

  const currentPath = window.location.pathname;

      // Add the 'active' class to the corresponding link
      const activeLink = document.querySelector(`#linkNav a[href="${currentPath}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }

    


    // Set the active link when the page loads
    window.addEventListener('load', setActiveLink);

    // Update the active link when the pathname changes (in case of SPA routing)
    window.addEventListener('popstate', setActiveLink);