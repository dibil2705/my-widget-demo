    // Находим кнопку и элемент для вывода сообщения
    const button = document.getElementById('myButton');
    const message = document.getElementById('message');

    // Добавляем обработчик клика
    button.addEventListener('click', () => {
      message.textContent = 'Кнопка была нажата!';
    });
