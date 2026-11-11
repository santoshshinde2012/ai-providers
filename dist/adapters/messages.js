export function messagesWithRole(request, role) {
    return request.messages.filter((message) => message.role === role);
}
//# sourceMappingURL=messages.js.map