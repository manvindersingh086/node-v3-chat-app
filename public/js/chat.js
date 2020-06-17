const socket = io()

const $messages = document.querySelector('#messages')
const $messagetemplate = document.querySelector('#message-template').innerHTML
const $sidebartemplate = document.querySelector('#sidebar-template').innerHTML


const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoScroll = () => {
    // New message Element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of the message container
    const containerHeight = $messages.scrollHeight

    //How far i have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    const html = Mustache.render($messagetemplate,{
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h: mm a')

    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
    
})

const $locationMessageTemplate = document.querySelector('#locationmessage-template').innerHTML
socket.on('locationMessage', (url) => {
    const html = Mustache.render($locationMessageTemplate,{
        url:url.url,
        createdAt:moment(url.createdAt).format('h: mm a'),
        username:url.username
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users}) => {
    const html = Mustache.render($sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('Input')
const $messageFormButton = $messageForm.querySelector('Button')
const $LocationButton = document.querySelector('#sendlocation')



$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = document.querySelector('input').value
    socket.emit('sendMessage',message, (error) => {

       if(error)
       {
           return console.log(error)
       }
       $messageFormButton.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus()
       console.log('Message delivered!')
    })
})

$LocationButton.addEventListener('click', () => {

    $LocationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation)
    {
        return alert('Your browser doesnot support location feature.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        
       socket.emit('sendLocation', {
           'latitude': position.coords.latitude,
           'longitude':position.coords.longitude
       }, () => {
            
           console.log('Location Shared!')
           $LocationButton.removeAttribute('disabled')
           $messageFormInput.focus()
       })

    })

    
})

socket.emit('join', {username, room}, (error) => {
    if(error)
    {
        alert(error)
        location.href = '/'
    }
    
})

