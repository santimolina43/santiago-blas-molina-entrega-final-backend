Swal.fire({
    icon: 'success',
    title: 'Has completado y pagado la compra exitosamente',
    text: 'A continuacion te mostramos tu ticket de compra.',
    showConfirmButton: true,
}).then((result) => {
    if (result.isConfirmed) {
      null;
    }
  });