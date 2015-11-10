/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package pointingpoker.websocket;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import javax.enterprise.context.ApplicationScoped;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.JsonObject;
import javax.json.spi.JsonProvider;
import javax.websocket.Session;
import pointingpoker.model.Member;

@ApplicationScoped
public class MemberSessionHandler {

	private int memberId = 0;
//	private final Set<Session> sessions = new HashSet();
//	private final Set<Member> members = new HashSet();
	private final Map<String, Set<Session>> sessions = new HashMap<>();
	private final Map<String, Set<Member>> members = new HashMap<>();

	public void addSession(Session session, String roomKey) {
		if(!sessions.containsKey(roomKey)){
			sessions.put(roomKey, new HashSet());
			Logger.getLogger(MemberSessionHandler.class.getName()).log(Level.INFO, "AddSession");
		}
		sessions.get(roomKey).add(session);
		if(members.containsKey(roomKey)){
			for (Member member : members.get(roomKey)) {
				JsonObject addMessage = createAddMessage(member);
				sendToSession(session, addMessage, roomKey);
			}
		}
	}

	public void addMember(Member member, String roomKey) {
		if(members.containsKey(roomKey)){
			
			Iterator it = members.get(roomKey).iterator();
			while (it.hasNext()) {
				Member mbr = (Member)it.next();
				System.out.println(member.getClientKey());
				if (member.getName().toLowerCase().equals(mbr.getName().toLowerCase())) {
					it.remove(); // avoids a ConcurrentModificationException
					removeMember(mbr, roomKey);
				}
			}
		}else{
			members.put(roomKey, new HashSet());
		}
		memberId++;
		member.setId(memberId);
		members.get(roomKey).add(member);
		JsonObject addMessage = createAddMessage(member);
		sendToAllConnectedSessions(addMessage, roomKey);
	}

	public void closeSession(Session session) {
		if(session.isOpen()){
			try {
				session.close();
			} catch (IOException ex) {
				Logger.getLogger(MemberSessionHandler.class.getName()).log(Level.SEVERE, null, ex);
			}
		}
	}
	
	private Member getMemberById(int id, String roomKey) {
		if(members.containsKey(roomKey)){
			for (Member member : members.get(roomKey)) {
				if (member.getId() == id) {
					return member;
				}
			}
		}
		return null;
	}

	private JsonObject createAddMessage(Member member) {
		JsonProvider provider = JsonProvider.provider();
		JsonObject addMessage = provider.createObjectBuilder()
				.add("action", "add")
				.add("id", member.getId())
				.add("name", member.getName())
				.add("vote", member.getVote())
				.add("clientKey", member.getClientKey())
				.add("observer", member.getObserver())
				.build();
		return addMessage;
	}

	public void removeMemberByClientKey(int clientKey, String roomKey) {
		for (Member member : members.get(roomKey)) {
			if(member.getClientKey().equals(clientKey)){
				removeMember(member, roomKey);
			}
		}		
	}
	
	public void removeMemberById(int memberId, String roomKey) {
		Member member = getMemberById(memberId, roomKey);
		removeMember(member, roomKey);
	}
	
	public void removeMember(Member member, String roomKey) {
		if (member != null) {
			if(members.get(roomKey).contains(member)){
				Logger.getLogger(MemberSessionHandler.class.getName()).log(Level.INFO, "removeMember");
				members.get(roomKey).remove(member);
			}
			JsonProvider provider = JsonProvider.provider();
			JsonObject removeMessage = provider.createObjectBuilder()
					.add("action", "remove")
					.add("id", member.getId())
					.add("clientKey", member.getClientKey())
					.build();
			sendToAllConnectedSessions(removeMessage, roomKey);
		}
	}
	
	private void sendToAllConnectedSessions(JsonObject message, String roomKey) {
		if(sessions.containsKey(roomKey)){
			Iterator it = sessions.get(roomKey).iterator();
			while (it.hasNext()) {
				Session session = (Session)it.next();
				if(!session.isOpen() || !sendToSession(session, message, roomKey)){
					it.remove();
				}
			}
		}
	}

	private boolean sendToSession(Session session, JsonObject message, String roomKey) {
		boolean success = false;
		try {
			session.getBasicRemote().sendText(message.toString());
			Logger.getLogger(MemberSessionHandler.class.getName()).log(Level.INFO, "sendToSession: {0}", message.toString());
			success = true;
		} catch (IOException | IllegalStateException ex) {
			//Logger.getLogger(MemberSessionHandler.class.getName()).log(Level.SEVERE, null, ex);
			success = false;
		}
		return success;
	}

	public void startNewGame(String roomKey) {
		for (Member member : members.get(roomKey)) {
			member.setVote("");
		}
		JsonProvider provider = JsonProvider.provider();
		JsonObject newGameMessage = provider.createObjectBuilder()
				.add("action", "newgame")
				.build();
		sendToAllConnectedSessions(newGameMessage, roomKey);
	}

	public void submitVote(int id, String vote, String roomKey) {
		JsonProvider provider = JsonProvider.provider();
		Member member = getMemberById(id, roomKey);
		if (member != null) {
			member.setVote(vote);
			JsonObject updateDevMessage = provider.createObjectBuilder()
					.add("action", "vote")
					.add("id", member.getId())
					.add("vote", vote)
					.build();
			sendToAllConnectedSessions(updateDevMessage, roomKey);
		}
		checkForGameComplete(roomKey);
	}

	public void checkForGameComplete(String roomKey) {
		Boolean gameIsComplete = true;

		for (Member member : members.get(roomKey)) {
			if(!member.getObserver() && member.getVote().isEmpty()){
				gameIsComplete = false;
				break;
			}
		}
		
		if (gameIsComplete) {
			JsonProvider provider = JsonProvider.provider();
			JsonObject showCardsMessage = provider.createObjectBuilder()
					.add("action", "showcards")
					.build();
			sendToAllConnectedSessions(showCardsMessage, roomKey);
		}
	}

	public List getMembers(String roomKey) {
		return new ArrayList<>(members.get(roomKey));
	}

}
