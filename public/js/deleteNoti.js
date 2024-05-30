document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn'); //all the btn delete in each cards
    const modal = document.getElementById('modalDeleteNotif');  // the modal
    const confirmDeleteBtn = document.getElementById('confirmDelete'); //The confirm btn in the modal
    const cancelDeleteBtn = document.getElementById('cancelDelete'); // the cancel btn


    let notificationIdToDelete = null; //The id of the notification

    deleteButtons.forEach(btn =>{
        btn.addEventListener('click', ()=>{
            notificationIdToDelete = btn.getAttribute('data-id');//to get the id assign to the btn and assign it to the variable
            modal.showModal(); //show the dialog
        });
    });

    cancelDeleteBtn.onclick = () =>{
        modal.close();
    };

    confirmDeleteBtn.onclick = () =>{
        if(notificationIdToDelete){
            fetch(`/deleteNotification/${notificationIdToDelete}`,  {method: 'post'})
            .then(response => response.json())
            .then(data => {
                if(data.success){
                    document.querySelector(`.delete-btn[data-id="${notificationIdToDelete}"]`).closest('.card').remove();
                } else {
                    console.log('Failed to delete notification');
                }
                modal.close();
                notificationIdToDelete = null;
            }).catch(error => console.error('Error: ', error));
        
        }
    }

    window.onclick = (event) =>{
        if (event.target == modal){
            modal.close();
        }
    }

});  