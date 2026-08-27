export const testMultipart = () => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "https://zera-server.onrender.com/api/profile/test");
    const fd = new FormData();
    fd.append("test", "test");
    xhr.send(fd);
}
