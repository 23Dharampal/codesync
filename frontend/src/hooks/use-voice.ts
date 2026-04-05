import { useState, useEffect, useRef, useCallback } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
} from "livekit-client";
import { getVoiceToken } from "@/lib/api";

export interface VoiceParticipant {
  identity: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isLocal: boolean;
}

export function useVoice(roomCode: string, displayName: string) {
  const roomRef = useRef<Room | null>(null);
  const audioContainerRef = useRef<HTMLDivElement | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [error, setError] = useState("");
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);

  // create a hidden div to attach remote audio elements
  useEffect(() => {
    const div = document.createElement("div");
    div.style.display = "none";
    document.body.appendChild(div);
    audioContainerRef.current = div;
    return () => { div.remove(); };
  }, []);

  const refreshParticipants = useCallback((room: Room) => {
    const local = room.localParticipant;
    const list: VoiceParticipant[] = [
      {
        identity: local.identity,
        isSpeaking: local.isSpeaking,
        isMuted: !local.isMicrophoneEnabled,
        isLocal: true,
      },
    ];
    room.remoteParticipants.forEach((p: RemoteParticipant) => {
      const pub = p.getTrackPublication(Track.Source.Microphone);
      list.push({
        identity: p.identity,
        isSpeaking: p.isSpeaking,
        isMuted: !pub?.isSubscribed || pub?.isMuted,
        isLocal: false,
      });
    });
    setParticipants(list);
  }, []);

  // attach remote audio track to a real <audio> element so browser plays it
  const attachAudio = useCallback((track: RemoteTrack, participant: RemoteParticipant) => {
    const container = audioContainerRef.current;
    if (!container || track.kind !== Track.Kind.Audio) return;
    const el = track.attach();
    el.id = `audio-${participant.identity}`;
    // remove old element for same participant if re-subscribing
    const old = container.querySelector(`#audio-${participant.identity}`);
    if (old) old.remove();
    container.appendChild(el);
    (el as HTMLAudioElement).play().catch(() => setNeedsAudioUnlock(true));
  }, []);

  const detachAudio = useCallback((track: RemoteTrack, participant: RemoteParticipant) => {
    const el = audioContainerRef.current?.querySelector(`#audio-${participant.identity}`);
    if (el) { track.detach(el as HTMLMediaElement); el.remove(); }
  }, []);

  const join = useCallback(async () => {
    if (roomRef.current) return;
    setConnecting(true);
    setError("");
    try {
      const { token, livekit_url } = await getVoiceToken(roomCode, displayName);

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.Connected, () => {
        setConnected(true);
        setConnecting(false);
        refreshParticipants(room);
      });

      room.on(RoomEvent.Disconnected, () => {
        setConnected(false);
        setParticipants([]);
        roomRef.current = null;
        // remove all audio elements
        if (audioContainerRef.current) audioContainerRef.current.innerHTML = "";
      });

      room.on(RoomEvent.ParticipantConnected, () => refreshParticipants(room));
      room.on(RoomEvent.ParticipantDisconnected, () => refreshParticipants(room));
      room.on(RoomEvent.ActiveSpeakersChanged, () => refreshParticipants(room));
      room.on(RoomEvent.TrackMuted, () => refreshParticipants(room));
      room.on(RoomEvent.TrackUnmuted, () => refreshParticipants(room));

      // key: attach remote audio when subscribed
      room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
        attachAudio(track, participant);
        refreshParticipants(room);
      });

      room.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
        detachAudio(track, participant);
        refreshParticipants(room);
      });

      await room.connect(livekit_url, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      // start audio context (needed after user gesture — connect is a user gesture)
      await room.startAudio();

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to join voice call");
      setConnecting(false);
      roomRef.current = null;
    }
  }, [roomCode, displayName, refreshParticipants, attachAudio, detachAudio]);

  // called when user clicks "unlock audio" banner
  const unlockAudio = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.startAudio();
      setNeedsAudioUnlock(false);
    }
  }, []);

  const leave = useCallback(async () => {
    if (!roomRef.current) return;
    await roomRef.current.disconnect();
    roomRef.current = null;
    setConnected(false);
    setParticipants([]);
    setMuted(false);
    setNeedsAudioUnlock(false);
    if (audioContainerRef.current) audioContainerRef.current.innerHTML = "";
  }, []);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const enabled = room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(!enabled);
    setMuted(enabled);
    refreshParticipants(room);
  }, [refreshParticipants]);

  useEffect(() => {
    return () => { roomRef.current?.disconnect(); };
  }, []);

  return { connected, connecting, muted, participants, error, needsAudioUnlock, join, leave, toggleMute, unlockAudio };
}
