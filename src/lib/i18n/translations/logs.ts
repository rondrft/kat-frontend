export const logsEn = {
  header: {
    label: "Logs",
    heading: "Log configuration",
    description: "Choose which events to log and where to send them. Each log type can go to a different channel, or use the default channel for all.",
  },
  categories: {
    channel: {
      label: "Channel",
      events: {
        channel_create: { label: "Channel Created", description: "A new text or voice channel was created" },
        channel_delete: { label: "Channel Deleted", description: "A channel was removed" },
        channel_update: { label: "Channel Renamed", description: "Channel name or topic changed" },
      },
    },
    message: {
      label: "Message",
      events: {
        message_delete: { label: "Message Deleted", description: "A message was removed from a channel" },
        message_bulk_delete: { label: "Bulk Delete", description: "Multiple messages were purged at once" },
        message_edit: { label: "Message Edited", description: "A message content was modified" },
      },
    },
    member: {
      label: "Member",
      events: {
        member_join: { label: "Member Joined", description: "A member joined the server" },
        member_leave: { label: "Member Left", description: "A member left the server" },
        member_update: { label: "Member Updated", description: "Nickname or avatar changed" },
        member_ban: { label: "Member Banned", description: "A user was banned from the server" },
        member_unban: { label: "Member Unbanned", description: "A user ban was lifted" },
      },
    },
    role: {
      label: "Role",
      events: {
        role_create: { label: "Role Created", description: "A new role was created" },
        role_delete: { label: "Role Deleted", description: "A role was removed" },
        role_update: { label: "Role Updated", description: "Role name or color changed" },
        role_add: { label: "Role Added", description: "When a member is given a role" },
        role_remove: { label: "Role Removed", description: "When a member is removed from a role" },
      },
    },
    invite: {
      label: "Invite",
      events: {
        invite_create: { label: "Invite Created", description: "A new server invite was generated" },
        invite_delete: { label: "Invite Deleted", description: "An invite link was revoked" },
        invite_used: { label: "Invite Used", description: "A member joined using an invite link" },
      },
    },
    voice: {
      label: "Voice",
      events: {
        voice_join: { label: "Voice Joined", description: "A member joined a voice channel" },
        voice_leave: { label: "Voice Left", description: "A member left a voice channel" },
        voice_move: { label: "Voice Moved", description: "A member switched between voice channels" },
        voice_kick: { label: "Voice Kicked", description: "A member was disconnected from a voice channel" },
        voice_mute: { label: "Voice Muted", description: "A member was server muted in a voice channel" },
        voice_deafen: { label: "Voice Deafened", description: "A member was server deafened in a voice channel" },
      },
    },
  },
  channelSelect: {
    placeholder: "Channel",
    noChannel: "No channel",
    selectChannel: "Select channel",
    notFound: "Channel no longer exists",
  },
  defaultChannel: {
    label: "Default channel for all logs",
    loading: "Loading channels\u2026",
    select: "Select default channel",
    noDefaultWarning: "No default channel set. Events without a custom channel will not be logged.",
    notFoundWarning: "Default channel no longer exists. Please select a new one.",
  },
  toolbar: {
    activeCount: "{totalEnabled} active",
    disableAll: "Disable all",
    enableAll: "Enable all",
    saving: "Saving\u2026",
    saveChanges: "Save changes",
    adminOnly: "Only server admins can configure logging.",
  },
  status: {
    loadError: "Failed to load logging configuration.",
    saveSuccess: "Configuration saved successfully.",
    saveError: "Failed to save logging configuration.",
    forbidden: "Only server admins can configure logging.",
  },
} as const;

export const logsEs = {
  header: {
    label: "Registros",
    heading: "Configuraci\u00f3n de registros",
    description: "Elige qu\u00e9 eventos registrar y d\u00f3nde enviarlos. Cada tipo de registro puede ir a un canal diferente o usar el canal predeterminado para todos.",
  },
  categories: {
    channel: {
      label: "Canal",
      events: {
        channel_create: { label: "Canal Creado", description: "Se cre\u00f3 un nuevo canal de texto o voz" },
        channel_delete: { label: "Canal Eliminado", description: "Se elimin\u00f3 un canal" },
        channel_update: { label: "Canal Renombrado", description: "Cambi\u00f3 el nombre o tema del canal" },
      },
    },
    message: {
      label: "Mensaje",
      events: {
        message_delete: { label: "Mensaje Eliminado", description: "Se elimin\u00f3 un mensaje de un canal" },
        message_bulk_delete: { label: "Eliminaci\u00f3n Masiva", description: "Se purgaron varios mensajes a la vez" },
        message_edit: { label: "Mensaje Editado", description: "Se modific\u00f3 el contenido de un mensaje" },
      },
    },
    member: {
      label: "Miembro",
      events: {
        member_join: { label: "Miembro Unido", description: "Un miembro se uni\u00f3 al servidor" },
        member_leave: { label: "Miembro Salido", description: "Un miembro abandon\u00f3 el servidor" },
        member_update: { label: "Miembro Actualizado", description: "Cambi\u00f3 el apodo o avatar" },
        member_ban: { label: "Miembro Baneado", description: "Un usuario fue baneado del servidor" },
        member_unban: { label: "Miembro Desbaneado", description: "Se levant\u00f3 el baneo de un usuario" },
      },
    },
    role: {
      label: "Rol",
      events: {
        role_create: { label: "Rol Creado", description: "Se cre\u00f3 un nuevo rol" },
        role_delete: { label: "Rol Eliminado", description: "Se elimin\u00f3 un rol" },
        role_update: { label: "Rol Actualizado", description: "Cambi\u00f3 el nombre o color del rol" },
        role_add: { label: "Rol A\u00f1adido", description: "Cuando un miembro recibe un rol" },
        role_remove: { label: "Rol Removido", description: "Cuando un miembro es removido de un rol" },
      },
    },
    invite: {
      label: "Invitaci\u00f3n",
      events: {
        invite_create: { label: "Invitaci\u00f3n Creada", description: "Se gener\u00f3 una nueva invitaci\u00f3n al servidor" },
        invite_delete: { label: "Invitaci\u00f3n Eliminada", description: "Se revoc\u00f3 un enlace de invitaci\u00f3n" },
        invite_used: { label: "Invitaci\u00f3n Usada", description: "Un miembro se uni\u00f3 usando un enlace de invitaci\u00f3n" },
      },
    },
    voice: {
      label: "Voz",
      events: {
        voice_join: { label: "Voz Conectado", description: "Un miembro se conect\u00f3 a un canal de voz" },
        voice_leave: { label: "Voz Desconectado", description: "Un miembro se desconect\u00f3 de un canal de voz" },
        voice_move: { label: "Voz Movido", description: "Un miembro cambi\u00f3 entre canales de voz" },
        voice_kick: { label: "Voz Expulsado", description: "Un miembro fue desconectado de un canal de voz" },
        voice_mute: { label: "Voz Silenciado", description: "Un miembro fue silenciado por el servidor en un canal de voz" },
        voice_deafen: { label: "Voz Ensordecido", description: "Un miembro fue ensordecido por el servidor en un canal de voz" },
      },
    },
  },
  channelSelect: {
    placeholder: "Canal",
    noChannel: "Sin canal",
    selectChannel: "Seleccionar canal",
    notFound: "El canal ya no existe",
  },
  defaultChannel: {
    label: "Canal predeterminado para todos los registros",
    loading: "Cargando canales\u2026",
    select: "Seleccionar canal predeterminado",
    noDefaultWarning: "No hay canal predeterminado configurado. Los eventos sin canal personalizado no se registrar\u00e1n.",
    notFoundWarning: "El canal predeterminado ya no existe. Por favor selecciona uno nuevo.",
  },
  toolbar: {
    activeCount: "{totalEnabled} activos",
    disableAll: "Desactivar todos",
    enableAll: "Activar todos",
    saving: "Guardando\u2026",
    saveChanges: "Guardar cambios",
    adminOnly: "Solo los administradores del servidor pueden configurar los registros.",
  },
  status: {
    loadError: "Error al cargar la configuraci\u00f3n de registros.",
    saveSuccess: "Configuraci\u00f3n guardada exitosamente.",
    saveError: "Error al guardar la configuraci\u00f3n de registros.",
    forbidden: "Solo los administradores del servidor pueden configurar los registros.",
  },
} as const;

export const logsPtBr = {
  header: {
    label: "Registros",
    heading: "Configura\u00e7\u00e3o de registros",
    description: "Escolha quais eventos registrar e para onde envi\u00e1-los. Cada tipo de registro pode ir para um canal diferente ou usar o canal padr\u00e3o para todos.",
  },
  categories: {
    channel: {
      label: "Canal",
      events: {
        channel_create: { label: "Canal Criado", description: "Um novo canal de texto ou voz foi criado" },
        channel_delete: { label: "Canal Exclu\u00eddo", description: "Um canal foi removido" },
        channel_update: { label: "Canal Renomeado", description: "Nome ou t\u00f3pico do canal alterado" },
      },
    },
    message: {
      label: "Mensagem",
      events: {
        message_delete: { label: "Mensagem Exclu\u00edda", description: "Uma mensagem foi removida de um canal" },
        message_bulk_delete: { label: "Exclus\u00e3o em Massa", description: "V\u00e1rias mensagens foram purgadas de uma vez" },
        message_edit: { label: "Mensagem Editada", description: "O conte\u00fado de uma mensagem foi modificado" },
      },
    },
    member: {
      label: "Membro",
      events: {
        member_join: { label: "Membro Entrou", description: "Um membro entrou no servidor" },
        member_leave: { label: "Membro Saiu", description: "Um membro saiu do servidor" },
        member_update: { label: "Membro Atualizado", description: "Apelido ou avatar alterado" },
        member_ban: { label: "Membro Banido", description: "Um usu\u00e1rio foi banido do servidor" },
        member_unban: { label: "Membro Desbanido", description: "O banimento de um usu\u00e1rio foi removido" },
      },
    },
    role: {
      label: "Cargo",
      events: {
        role_create: { label: "Cargo Criado", description: "Um novo cargo foi criado" },
        role_delete: { label: "Cargo Exclu\u00eddo", description: "Um cargo foi removido" },
        role_update: { label: "Cargo Atualizado", description: "Nome ou cor do cargo alterado" },
        role_add: { label: "Cargo Adicionado", description: "Quando um membro recebe um cargo" },
        role_remove: { label: "Cargo Removido", description: "Quando um membro \u00e9 removido de um cargo" },
      },
    },
    invite: {
      label: "Convite",
      events: {
        invite_create: { label: "Convite Criado", description: "Um novo convite para o servidor foi gerado" },
        invite_delete: { label: "Convite Exclu\u00eddo", description: "Um link de convite foi revogado" },
        invite_used: { label: "Convite Usado", description: "Um membro entrou usando um link de convite" },
      },
    },
    voice: {
      label: "Voz",
      events: {
        voice_join: { label: "Voz Conectou", description: "Um membro entrou em um canal de voz" },
        voice_leave: { label: "Voz Desconectou", description: "Um membro saiu de um canal de voz" },
        voice_move: { label: "Voz Moveu", description: "Um membro mudou entre canais de voz" },
        voice_kick: { label: "Voz Desconectado", description: "Um membro foi desconectado de um canal de voz" },
        voice_mute: { label: "Voz Silenciado", description: "Um membro foi silenciado pelo servidor em um canal de voz" },
        voice_deafen: { label: "Voz Ensurdecido", description: "Um membro foi ensurdecido pelo servidor em um canal de voz" },
      },
    },
  },
  channelSelect: {
    placeholder: "Canal",
    noChannel: "Sem canal",
    selectChannel: "Selecionar canal",
    notFound: "O canal n\u00e3o existe mais",
  },
  defaultChannel: {
    label: "Canal padr\u00e3o para todos os registros",
    loading: "Carregando canais\u2026",
    select: "Selecionar canal padr\u00e3o",
    noDefaultWarning: "Nenhum canal padr\u00e3o definido. Eventos sem canal personalizado n\u00e3o ser\u00e3o registrados.",
    notFoundWarning: "O canal padr\u00e3o n\u00e3o existe mais. Por favor, selecione um novo.",
  },
  toolbar: {
    activeCount: "{totalEnabled} ativos",
    disableAll: "Desativar todos",
    enableAll: "Ativar todos",
    saving: "Salvando\u2026",
    saveChanges: "Salvar altera\u00e7\u00f5es",
    adminOnly: "Apenas administradores do servidor podem configurar os registros.",
  },
  status: {
    loadError: "Falha ao carregar configura\u00e7\u00e3o de registros.",
    saveSuccess: "Configura\u00e7\u00e3o salva com sucesso.",
    saveError: "Falha ao salvar configura\u00e7\u00e3o de registros.",
    forbidden: "Apenas administradores do servidor podem configurar os registros.",
  },
} as const;

export const logsFr = {
  header: {
    label: "Journaux",
    heading: "Configuration des journaux",
    description: "Choisissez les \u00e9v\u00e9nements \u00e0 enregistrer et o\u00f9 les envoyer. Chaque type de journal peut aller dans un salon diff\u00e9rent ou utiliser le salon par d\u00e9faut pour tous.",
  },
  categories: {
    channel: {
      label: "Salon",
      events: {
        channel_create: { label: "Salon Cr\u00e9\u00e9", description: "Un nouveau salon textuel ou vocal a \u00e9t\u00e9 cr\u00e9\u00e9" },
        channel_delete: { label: "Salon Supprim\u00e9", description: "Un salon a \u00e9t\u00e9 supprim\u00e9" },
        channel_update: { label: "Salon Renomm\u00e9", description: "Le nom ou le sujet du salon a chang\u00e9" },
      },
    },
    message: {
      label: "Message",
      events: {
        message_delete: { label: "Message Supprim\u00e9", description: "Un message a \u00e9t\u00e9 supprim\u00e9 d'un salon" },
        message_bulk_delete: { label: "Suppression Multiple", description: "Plusieurs messages ont \u00e9t\u00e9 purg\u00e9s d'un coup" },
        message_edit: { label: "Message Modifi\u00e9", description: "Le contenu d'un message a \u00e9t\u00e9 modifi\u00e9" },
      },
    },
    member: {
      label: "Membre",
      events: {
        member_join: { label: "Membre Rejoint", description: "Un membre a rejoint le serveur" },
        member_leave: { label: "Membre Parti", description: "Un membre a quitt\u00e9 le serveur" },
        member_update: { label: "Membre Mis \u00e0 Jour", description: "Surnom ou avatar modifi\u00e9" },
        member_ban: { label: "Membre Banni", description: "Un utilisateur a \u00e9t\u00e9 banni du serveur" },
        member_unban: { label: "Membre D\u00e9banni", description: "Le bannissement d'un utilisateur a \u00e9t\u00e9 lev\u00e9" },
      },
    },
    role: {
      label: "R\u00f4le",
      events: {
        role_create: { label: "R\u00f4le Cr\u00e9\u00e9", description: "Un nouveau r\u00f4le a \u00e9t\u00e9 cr\u00e9\u00e9" },
        role_delete: { label: "R\u00f4le Supprim\u00e9", description: "Un r\u00f4le a \u00e9t\u00e9 supprim\u00e9" },
        role_update: { label: "R\u00f4le Mis \u00e0 Jour", description: "Nom ou couleur du r\u00f4le modifi\u00e9" },
        role_add: { label: "R\u00f4le Ajout\u00e9", description: "Lorsqu'un membre re\u00e7oit un r\u00f4le" },
        role_remove: { label: "R\u00f4le Retir\u00e9", description: "Lorsqu'un membre est retir\u00e9 d'un r\u00f4le" },
      },
    },
    invite: {
      label: "Invitation",
      events: {
        invite_create: { label: "Invitation Cr\u00e9\u00e9e", description: "Une nouvelle invitation au serveur a \u00e9t\u00e9 g\u00e9n\u00e9r\u00e9e" },
        invite_delete: { label: "Invitation Supprim\u00e9e", description: "Un lien d'invitation a \u00e9t\u00e9 r\u00e9voqu\u00e9" },
        invite_used: { label: "Invitation Utilis\u00e9e", description: "Un membre a rejoint en utilisant un lien d'invitation" },
      },
    },
    voice: {
      label: "Vocal",
      events: {
        voice_join: { label: "Vocal Rejoint", description: "Un membre a rejoint un salon vocal" },
        voice_leave: { label: "Vocal Quitt\u00e9", description: "Un membre a quitt\u00e9 un salon vocal" },
        voice_move: { label: "Vocal D\u00e9plac\u00e9", description: "Un membre a chang\u00e9 de salon vocal" },
        voice_kick: { label: "Vocal Expuls\u00e9", description: "Un membre a \u00e9t\u00e9 d\u00e9connect\u00e9 d'un salon vocal" },
        voice_mute: { label: "Vocal Rendu Muet", description: "Un membre a \u00e9t\u00e9 rendu muet par le serveur dans un salon vocal" },
        voice_deafen: { label: "Vocal Sourd", description: "Un membre a \u00e9t\u00e9 rendu sourd par le serveur dans un salon vocal" },
      },
    },
  },
  channelSelect: {
    placeholder: "Salon",
    noChannel: "Aucun salon",
    selectChannel: "S\u00e9lectionner un salon",
    notFound: "Le salon n'existe plus",
  },
  defaultChannel: {
    label: "Salon par d\u00e9faut pour tous les journaux",
    loading: "Chargement des salons\u2026",
    select: "S\u00e9lectionner le salon par d\u00e9faut",
    noDefaultWarning: "Aucun salon par d\u00e9faut d\u00e9fini. Les \u00e9v\u00e9nements sans salon personnalis\u00e9 ne seront pas enregistr\u00e9s.",
    notFoundWarning: "Le salon par d\u00e9faut n'existe plus. Veuillez en s\u00e9lectionner un nouveau.",
  },
  toolbar: {
    activeCount: "{totalEnabled} actifs",
    disableAll: "Tout d\u00e9sactiver",
    enableAll: "Tout activer",
    saving: "Enregistrement\u2026",
    saveChanges: "Enregistrer les modifications",
    adminOnly: "Seuls les administrateurs du serveur peuvent configurer les journaux.",
  },
  status: {
    loadError: "\u00c9chec du chargement de la configuration des journaux.",
    saveSuccess: "Configuration enregistr\u00e9e avec succ\u00e8s.",
    saveError: "\u00c9chec de l'enregistrement de la configuration des journaux.",
    forbidden: "Seuls les administrateurs du serveur peuvent configurer les journaux.",
  },
} as const;

export const logsDe = {
  header: {
    label: "Protokolle",
    heading: "Log-Konfiguration",
    description: "W\u00e4hle aus, welche Ereignisse protokolliert und wohin sie gesendet werden sollen. Jeder Protokolltyp kann an einen anderen Kanal gehen oder den Standardkanal f\u00fcr alle verwenden.",
  },
  categories: {
    channel: {
      label: "Kanal",
      events: {
        channel_create: { label: "Kanal Erstellt", description: "Ein neuer Text- oder Sprachkanal wurde erstellt" },
        channel_delete: { label: "Kanal Gel\u00f6scht", description: "Ein Kanal wurde entfernt" },
        channel_update: { label: "Kanal Umbenannt", description: "Kanalname oder -thema ge\u00e4ndert" },
      },
    },
    message: {
      label: "Nachricht",
      events: {
        message_delete: { label: "Nachricht Gel\u00f6scht", description: "Eine Nachricht wurde aus einem Kanal entfernt" },
        message_bulk_delete: { label: "Massenl\u00f6schung", description: "Mehrere Nachrichten wurden auf einmal gel\u00f6scht" },
        message_edit: { label: "Nachricht Bearbeitet", description: "Der Inhalt einer Nachricht wurde ge\u00e4ndert" },
      },
    },
    member: {
      label: "Mitglied",
      events: {
        member_join: { label: "Mitglied Beitreten", description: "Ein Mitglied ist dem Server beigetreten" },
        member_leave: { label: "Mitglied Verlassen", description: "Ein Mitglied hat den Server verlassen" },
        member_update: { label: "Mitglied Aktualisiert", description: "Spitzname oder Avatar ge\u00e4ndert" },
        member_ban: { label: "Mitglied Gebannt", description: "Ein Benutzer wurde vom Server gebannt" },
        member_unban: { label: "Mitglied Entbannt", description: "Die Sperre eines Benutzers wurde aufgehoben" },
      },
    },
    role: {
      label: "Rolle",
      events: {
        role_create: { label: "Rolle Erstellt", description: "Eine neue Rolle wurde erstellt" },
        role_delete: { label: "Rolle Gel\u00f6scht", description: "Eine Rolle wurde entfernt" },
        role_update: { label: "Rolle Aktualisiert", description: "Rollenname oder -farbe ge\u00e4ndert" },
        role_add: { label: "Rolle Hinzugef\u00fcgt", description: "Wenn ein Mitglied eine Rolle erh\u00e4lt" },
        role_remove: { label: "Rolle Entfernt", description: "Wenn ein Mitglied von einer Rolle entfernt wird" },
      },
    },
    invite: {
      label: "Einladung",
      events: {
        invite_create: { label: "Einladung Erstellt", description: "Eine neue Servereinladung wurde generiert" },
        invite_delete: { label: "Einladung Gel\u00f6scht", description: "Ein Einladungslink wurde widerrufen" },
        invite_used: { label: "Einladung Verwendet", description: "Ein Mitglied ist \u00fcber einen Einladungslink beigetreten" },
      },
    },
    voice: {
      label: "Sprache",
      events: {
        voice_join: { label: "Sprache Beitreten", description: "Ein Mitglied ist einem Sprachkanal beigetreten" },
        voice_leave: { label: "Sprache Verlassen", description: "Ein Mitglied hat einen Sprachkanal verlassen" },
        voice_move: { label: "Sprache Gewechselt", description: "Ein Mitglied hat zwischen Sprachkan\u00e4len gewechselt" },
        voice_kick: { label: "Sprache Entfernt", description: "Ein Mitglied wurde aus einem Sprachkanal getrennt" },
        voice_mute: { label: "Sprache Stummgeschaltet", description: "Ein Mitglied wurde im Sprachkanal vom Server stummgeschaltet" },
        voice_deafen: { label: "Sprache Taubgeschaltet", description: "Ein Mitglied wurde im Sprachkanal vom Server taubgeschaltet" },
      },
    },
  },
  channelSelect: {
    placeholder: "Kanal",
    noChannel: "Kein Kanal",
    selectChannel: "Kanal ausw\u00e4hlen",
    notFound: "Kanal existiert nicht mehr",
  },
  defaultChannel: {
    label: "Standardkanal f\u00fcr alle Protokolle",
    loading: "Kan\u00e4le werden geladen\u2026",
    select: "Standardkanal ausw\u00e4hlen",
    noDefaultWarning: "Kein Standardkanal festgelegt. Ereignisse ohne benutzerdefinierten Kanal werden nicht protokolliert.",
    notFoundWarning: "Der Standardkanal existiert nicht mehr. Bitte w\u00e4hle einen neuen aus.",
  },
  toolbar: {
    activeCount: "{totalEnabled} aktiv",
    disableAll: "Alle deaktivieren",
    enableAll: "Alle aktivieren",
    saving: "Speichern\u2026",
    saveChanges: "\u00c4nderungen speichern",
    adminOnly: "Nur Server-Administratoren k\u00f6nnen die Protokollierung konfigurieren.",
  },
  status: {
    loadError: "Fehler beim Laden der Log-Konfiguration.",
    saveSuccess: "Konfiguration erfolgreich gespeichert.",
    saveError: "Fehler beim Speichern der Log-Konfiguration.",
    forbidden: "Nur Server-Administratoren k\u00f6nnen die Protokollierung konfigurieren.",
  },
} as const;

export const logsJa = {
  header: {
    label: "\u30ed\u30b0",
    heading: "\u30ed\u30b0\u8a2d\u5b9a",
    description: "\u8a18\u9332\u3059\u308b\u30a4\u30d9\u30f3\u30c8\u3068\u9001\u4fe1\u5148\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u5404\u30ed\u30b0\u30bf\u30a4\u30d7\u306f\u7570\u306a\u308b\u30c1\u30e3\u30f3\u30cd\u30eb\u306b\u9001\u308b\u304b\u3001\u3059\u3079\u3066\u306b\u30c7\u30d5\u30a9\u30eb\u30c8\u30c1\u30e3\u30f3\u30cd\u30eb\u3092\u4f7f\u7528\u3067\u304d\u307e\u3059\u3002",
  },
  categories: {
    channel: {
      label: "\u30c1\u30e3\u30f3\u30cd\u30eb",
      events: {
        channel_create: { label: "\u30c1\u30e3\u30f3\u30cd\u30eb\u4f5c\u6210", description: "\u65b0\u3057\u3044\u30c6\u30ad\u30b9\u30c8\u307e\u305f\u306f\u30dc\u30a4\u30b9\u30c1\u30e3\u30f3\u30cd\u30eb\u304c\u4f5c\u6210\u3055\u308c\u307e\u3057\u305f" },
        channel_delete: { label: "\u30c1\u30e3\u30f3\u30cd\u30eb\u524a\u9664", description: "\u30c1\u30e3\u30f3\u30cd\u30eb\u304c\u524a\u9664\u3055\u308c\u307e\u3057\u305f" },
        channel_update: { label: "\u30c1\u30e3\u30f3\u30cd\u30eb\u5909\u66f4", description: "\u30c1\u30e3\u30f3\u30cd\u30eb\u540d\u307e\u305f\u306f\u30c8\u30d4\u30c3\u30af\u304c\u5909\u66f4\u3055\u308c\u307e\u3057\u305f" },
      },
    },
    message: {
      label: "\u30e1\u30c3\u30bb\u30fc\u30b8",
      events: {
        message_delete: { label: "\u30e1\u30c3\u30bb\u30fc\u30b8\u524a\u9664", description: "\u30c1\u30e3\u30f3\u30cd\u30eb\u304b\u3089\u30e1\u30c3\u30bb\u30fc\u30b8\u304c\u524a\u9664\u3055\u308c\u307e\u3057\u305f" },
        message_bulk_delete: { label: "\u4e00\u62ec\u524a\u9664", description: "\u8907\u6570\u306e\u30e1\u30c3\u30bb\u30fc\u30b8\u304c\u4e00\u5ea6\u306b\u30d1\u30fc\u30b8\u3055\u308c\u307e\u3057\u305f" },
        message_edit: { label: "\u30e1\u30c3\u30bb\u30fc\u30b8\u7de8\u96c6", description: "\u30e1\u30c3\u30bb\u30fc\u30b8\u306e\u5185\u5bb9\u304c\u5909\u66f4\u3055\u308c\u307e\u3057\u305f" },
      },
    },
    member: {
      label: "\u30e1\u30f3\u30d0\u30fc",
      events: {
        member_join: { label: "\u30e1\u30f3\u30d0\u30fc\u53c2\u52a0", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30b5\u30fc\u30d0\u30fc\u306b\u53c2\u52a0\u3057\u307e\u3057\u305f" },
        member_leave: { label: "\u30e1\u30f3\u30d0\u30fc\u9000\u51fa", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30b5\u30fc\u30d0\u30fc\u304b\u3089\u9000\u51fa\u3057\u307e\u3057\u305f" },
        member_update: { label: "\u30e1\u30f3\u30d0\u30fc\u66f4\u65b0", description: "\u30cb\u30c3\u30af\u30cd\u30fc\u30e0\u307e\u305f\u306f\u30a2\u30d0\u30bf\u30fc\u304c\u5909\u66f4\u3055\u308c\u307e\u3057\u305f" },
        member_ban: { label: "\u30e1\u30f3\u30d0\u30fcBAN", description: "\u30e6\u30fc\u30b6\u30fc\u304c\u30b5\u30fc\u30d0\u30fc\u304b\u3089BAN\u3055\u308c\u307e\u3057\u305f" },
        member_unban: { label: "\u30e1\u30f3\u30d0\u30fcBAN\u89e3\u9664", description: "\u30e6\u30fc\u30b6\u30fc\u306eBAN\u304c\u89e3\u9664\u3055\u308c\u307e\u3057\u305f" },
      },
    },
    role: {
      label: "\u30ed\u30fc\u30eb",
      events: {
        role_create: { label: "\u30ed\u30fc\u30eb\u4f5c\u6210", description: "\u65b0\u3057\u3044\u30ed\u30fc\u30eb\u304c\u4f5c\u6210\u3055\u308c\u307e\u3057\u305f" },
        role_delete: { label: "\u30ed\u30fc\u30eb\u524a\u9664", description: "\u30ed\u30fc\u30eb\u304c\u524a\u9664\u3055\u308c\u307e\u3057\u305f" },
        role_update: { label: "\u30ed\u30fc\u30eb\u66f4\u65b0", description: "\u30ed\u30fc\u30eb\u540d\u307e\u305f\u306f\u8272\u304c\u5909\u66f4\u3055\u308c\u307e\u3057\u305f" },
        role_add: { label: "\u30ed\u30fc\u30eb\u8ffd\u52a0", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30ed\u30fc\u30eb\u3092\u736e\u5f97\u3057\u305f\u5834\u5408" },
        role_remove: { label: "\u30ed\u30fc\u30eb\u5931\u53bb", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30ed\u30fc\u30eb\u304b\u3089\u524a\u9664\u3055\u308c\u305f\u5834\u5408" },
      },
    },
    invite: {
      label: "\u62db\u5f85",
      events: {
        invite_create: { label: "\u62db\u5f85\u4f5c\u6210", description: "\u65b0\u3057\u3044\u30b5\u30fc\u30d0\u30fc\u62db\u5f85\u304c\u751f\u6210\u3055\u308c\u307e\u3057\u305f" },
        invite_delete: { label: "\u62db\u5f85\u524a\u9664", description: "\u62db\u5f85\u30ea\u30f3\u30af\u304c\u53d6\u308a\u6d88\u3055\u308c\u307e\u3057\u305f" },
        invite_used: { label: "\u62db\u5f85\u4f7f\u7528", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u62db\u5f85\u30ea\u30f3\u30af\u3092\u4f7f\u7528\u3057\u3066\u53c2\u52a0\u3057\u307e\u3057\u305f" },
      },
    },
    voice: {
      label: "\u30dc\u30a4\u30b9",
      events: {
        voice_join: { label: "\u30dc\u30a4\u30b9\u53c2\u52a0", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30dc\u30a4\u30b9\u30c1\u30e3\u30f3\u30cd\u30eb\u306b\u53c2\u52a0\u3057\u307e\u3057\u305f" },
        voice_leave: { label: "\u30dc\u30a4\u30b9\u9000\u51fa", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30dc\u30a4\u30b9\u30c1\u30e3\u30f3\u30cd\u30eb\u304b\u3089\u9000\u51fa\u3057\u307e\u3057\u305f" },
        voice_move: { label: "\u30dc\u30a4\u30b9\u79fb\u52d5", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30dc\u30a4\u30b9\u30c1\u30e3\u30f3\u30cd\u30eb\u9593\u3092\u79fb\u52d5\u3057\u307e\u3057\u305f" },
        voice_kick: { label: "\u30dc\u30a4\u30b9\u5207\u65ad", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30dc\u30a4\u30b9\u30c1\u30e3\u30f3\u30cd\u30eb\u304b\u3089\u5207\u65ad\u3055\u308c\u307e\u3057\u305f" },
        voice_mute: { label: "\u30dc\u30a4\u30b9\u30df\u30e5\u30fc\u30c8", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30dc\u30a4\u30b9\u30c1\u30e3\u30f3\u30cd\u30eb\u3067\u30b5\u30fc\u30d0\u30fc\u30df\u30e5\u30fc\u30c8\u3055\u308c\u307e\u3057\u305f" },
        voice_deafen: { label: "\u30dc\u30a4\u30b9\u30c7\u30d5\u30f3", description: "\u30e1\u30f3\u30d0\u30fc\u304c\u30dc\u30a4\u30b9\u30c1\u30e3\u30f3\u30cd\u30eb\u3067\u30b5\u30fc\u30d0\u30fc\u30c7\u30d5\u30f3\u3055\u308c\u307e\u3057\u305f" },
      },
    },
  },
  channelSelect: {
    placeholder: "\u30c1\u30e3\u30f3\u30cd\u30eb",
    noChannel: "\u30c1\u30e3\u30f3\u30cd\u30eb\u306a\u3057",
    selectChannel: "\u30c1\u30e3\u30f3\u30cd\u30eb\u3092\u9078\u629e",
    notFound: "\u30c1\u30e3\u30f3\u30cd\u30eb\u306f\u5b58\u5728\u3057\u307e\u305b\u3093",
  },
  defaultChannel: {
    label: "\u3059\u3079\u3066\u306e\u30ed\u30b0\u306e\u30c7\u30d5\u30a9\u30eb\u30c8\u30c1\u30e3\u30f3\u30cd\u30eb",
    loading: "\u30c1\u30e3\u30f3\u30cd\u30eb\u3092\u8aad\u307f\u8fbc\u307f\u4e2d\u2026",
    select: "\u30c7\u30d5\u30a9\u30eb\u30c8\u30c1\u30e3\u30f3\u30cd\u30eb\u3092\u9078\u629e",
    noDefaultWarning: "\u30c7\u30d5\u30a9\u30eb\u30c8\u30c1\u30e3\u30f3\u30cd\u30eb\u304c\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002\u30ab\u30b9\u30bf\u30e0\u30c1\u30e3\u30f3\u30cd\u30eb\u304c\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u306a\u3044\u30a4\u30d9\u30f3\u30c8\u306f\u30ed\u30b0\u8a18\u9332\u3055\u308c\u307e\u305b\u3093\u3002",
    notFoundWarning: "\u30c7\u30d5\u30a9\u30eb\u30c8\u30c1\u30e3\u30f3\u30cd\u30eb\u306f\u5b58\u5728\u3057\u307e\u305b\u3093\u3002\u65b0\u3057\u3044\u30c1\u30e3\u30f3\u30cd\u30eb\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
  },
  toolbar: {
    activeCount: "{totalEnabled} \u30a2\u30af\u30c6\u30a3\u30d6",
    disableAll: "\u3059\u3079\u3066\u7121\u52b9\u5316",
    enableAll: "\u3059\u3079\u3066\u6709\u52b9\u5316",
    saving: "\u4fdd\u5b58\u4e2d\u2026",
    saveChanges: "\u5909\u66f4\u3092\u4fdd\u5b58",
    adminOnly: "\u30b5\u30fc\u30d0\u30fc\u7ba1\u7406\u8005\u306e\u307f\u304c\u30ed\u30b0\u8a2d\u5b9a\u3092\u69cb\u6210\u3067\u304d\u307e\u3059\u3002",
  },
  status: {
    loadError: "\u30ed\u30b0\u8a2d\u5b9a\u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002",
    saveSuccess: "\u8a2d\u5b9a\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002",
    saveError: "\u30ed\u30b0\u8a2d\u5b9a\u306e\u4fdd\u5b58\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002",
    forbidden: "\u30b5\u30fc\u30d0\u30fc\u7ba1\u7406\u8005\u306e\u307f\u304c\u30ed\u30b0\u8a2d\u5b9a\u3092\u69cb\u6210\u3067\u304d\u307e\u3059\u3002",
  },
} as const;
