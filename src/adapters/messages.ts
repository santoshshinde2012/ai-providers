import type {CanonicalChatRequest, ChatMessage} from '../protocol.js';

export function messagesWithRole(
  request: CanonicalChatRequest,
  role: ChatMessage['role'],
): ChatMessage[] {
  return request.messages.filter((message) => message.role === role);
}
