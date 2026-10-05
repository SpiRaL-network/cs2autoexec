"""Build factual settings metadata from a reviewed GameTracking-CS2 snapshot.

Download DumpSource2/convars.txt into SOURCE_DIR/convars.txt.
Download game/csgo/pak01_dir/panorama/layout/settings/settings_{video,audio,game,kbmouse,crosshair}.xml
into SOURCE_DIR/menu-audit/ and resource/csgo_english.txt as menu-audit/english.txt.
Source: https://github.com/SteamTracking/GameTracking-CS2
Run: python tools/generate-catalog.py --source-dir SOURCE_DIR --checked-at YYYY-MM-DD
Review the diff and run tests before updating a release. No personal files are inputs.
"""
import json, re, pathlib, argparse, datetime, xml.etree.ElementTree as ET
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-dir',type=pathlib.Path,required=True)
parser.add_argument('--checked-at',default=datetime.date.today().isoformat())
args=parser.parse_args()
datetime.date.fromisoformat(args.checked_at)
base=args.source_dir
repo=pathlib.Path(__file__).resolve().parent.parent
out=repo/'studio'
out.mkdir(exist_ok=True)
english=(base/'menu-audit/english.txt').read_text(encoding='utf-8')
labels={k.lower():v for k,v in re.findall(r'"([^"\n]+)"\s+"([^"\n]*)"',english)}
def label(token):
    token=token.lstrip('#')
    return re.sub(r'<[^>]+>','',labels.get(token.lower(), token.replace('SFUI_','').replace('Settings_','').replace('_',' ')))
sections={
'settings_video_section':['Video','Vidéo'], 'settings_video_advanced_section':['Advanced video','Vidéo avancée'],
'settings_audio_section':['Audio','Audio'], 'settings_voice_section':['Voice','Voix'],
'settings_music_section':['Music','Musiques'], 'settings_audio_per_mode_section':['Equalizer by game mode','Égaliseur par mode'],
'settings_game_settings_section':['Game','Jeu'], 'settings_hud_section':['HUD','HUD'],
'settings_team_section':['Team','Équipe'], 'settings_communication_section':['Communication','Communication'],
'settings_spectator_section':['Spectator / scoreboard','Spectateur / scores'], 'settings_items_section':['Items','Objets'],
'settings_radarandtablet_section':['Radar / tablet','Radar / tablette'], 'settings_damage_prediction':['Damage prediction','Prédiction des dégâts'],
'settings_telemetry_section':['Telemetry','Télémétrie'], 'settings_keyboard_mouse_section':['Mouse','Souris'],
'settings_movement_binds_section':['Movement','Déplacement'], 'settings_weapon_binds_section':['Weapons','Armes'],
'settings_interface_binds_section':['Interface','Interface'], 'settings_communication_binds_section':['Communication','Communication'],
'settings_chatwheel_section':['Chat wheels','Roues de dialogue'],
'settings_video_frame_pacing':['Frame rate','Fréquence d’images'],
'settings_video_presets':['Graphics quality','Qualité graphique'],
'settings_audio_advanced_section':['Equalizer by game mode','Égaliseur par mode'],
'settings_crosshair_style':['Crosshair style','Style du viseur'],
'settings_crosshair_settings':['Crosshair options','Options du viseur'],
'settings_crosshair_grenade':['Grenade crosshair','Réticule des grenades'],
'settings_crosshair_sniper':['Sniper scopes','Lunettes des fusils de précision'],
'settings_ui_binds_section':['Interface','Interface'],
'settings_comm_binds_section':['Communication','Communication'],
'settings_ui_chatwheel_section':['Chat wheels','Roues de dialogue'],
}
fr={
'sensitivity':'Sensibilité de la souris', 'zoom_sensitivity_ratio':'Sensibilité du zoom', 'volume':'Volume principal',
'fps_max':'IPS max. en jeu', 'fps_max_ui':'IPS max. dans les menus', 'r_fullscreen_gamma':'Luminosité (gamma)',
'hud_scaling':'Échelle du HUD', 'cl_hud_color':'Couleur du HUD', 'cl_radar_scale':'Zoom de la carte du radar',
'cl_hud_radar_scale':'Taille du radar', 'cl_radar_always_centered':'Radar centré sur soi', 'cl_radar_rotate':'Radar rotatif',
'cl_radar_square_with_scoreboard':'Radar carré avec le tableau des scores', 'cl_radar_scale_alternate':'Zoom alternatif du radar',
'cl_radar_square_always':'Forcer le radar carré', 'cl_radar_dynamic':'Zoom dynamique du radar',
'snd_voipvolume':'Volume des voix', 'snd_menumap_volume':'Ambiance du menu principal', 'snd_musicvolume':'Volume des musiques',
'snd_menumusic_volume':'Musique du menu', 'snd_roundstart_volume':'Musique du début de manche',
'snd_roundaction_volume':'Musique des moments forts', 'snd_roundend_volume':'Musique de fin de manche',
'snd_mvp_volume':'Musique du meilleur joueur', 'snd_mapobjective_volume':'Musique des objectifs',
'snd_tensecondwarning_volume':'Avertissement avant explosion', 'snd_deathcamera_volume':'Caméra post-mortem',
'snd_headphone_eq':'Profil d’égaliseur audio', 'sound_device_override':'Périphérique audio',
'voice_device_override':'Périphérique du micro', 'voice_threshold':'Seuil de déclenchement du micro',
'snd_spatialize_lerp':'Isolation stéréo', 'snd_steamaudio_enable_perspective_correction':'Correction de perspective',
'snd_mute_losefocus':'Lecture audio en arrière-plan', 'voice_always_sample_mic':'Appuyer-pour-parler simplifié',
'voice_modenable':'Discussion vocale', 'voice_loopback':'Tester le retour de ma voix',
'option_duck_method':'Mode accroupi', 'option_speed_method':'Mode marche', 'cl_debounce_zoom':'Répéter le zoom au maintien',
'con_enable':'Console de développement', 'mm_dedicated_search_maxping':'Ping max. en matchmaking',
'rate':'Bande passante maximale', 'cl_net_buffer_ticks':'Mise en tampon réseau',
'viewmodel_presetpos':'Position de l’arme', 'cl_prefer_lefthanded':'Main préférée', 'cl_silencer_mode':'Détacher le silencieux',
'cl_showloadout':'Toujours afficher l’inventaire', 'cl_teamid_overhead_mode':'ID de l’équipe à travers les murs',
'cl_teamid_overhead_colors_show':'Couleurs individuelles des ID', 'cl_show_clan_in_death_notice':'Tags de groupe dans les morts',
'cl_force_spec_hud_color_to_team':'Couleur du HUD en mode spectateur',
'cl_crosshairstyle':'Style du viseur', 'cl_crosshair_length':'Longueur du viseur', 'cl_crosshair_thickness':'Épaisseur du viseur',
'cl_crosshairgap':'Écart du viseur', 'cl_crosshairdot':'Point central', 'cl_crosshair_t':'Style T',
'cl_crosshair_recoil':'Suivre le recul', 'cl_crosshair_drawoutline':'Contour du viseur',
'cl_crosshaircolor_r':'Viseur : rouge', 'cl_crosshaircolor_g':'Viseur : vert', 'cl_crosshaircolor_b':'Viseur : bleu',
'cl_crosshaircolor_a':'Viseur : transparence', 'cl_crosshair_sniper_width':'Épaisseur du viseur des lunettes',
'cl_crosshairgap_useweaponvalue':'Écart selon l’arme', 'cl_crosshair_friendly_warning':'Avertissement sur les alliés',
'cl_show_observer_crosshair':'Viseurs en mode spectateur', 'cl_observed_bot_crosshair':'Viseur en regardant les bots',
'cl_sniper_delay_unscope':'Différer le retrait de la lunette', 'cl_sniper_auto_rezoom':'Rezoomer automatiquement',
'cl_sniper_show_inaccuracy':'Afficher la marge d’imprécision',
'voice_loopback_no_networking':'Tester le retour de ma voix', 'snd_music_settings_mode':'Mode des volumes musicaux',
'snd_mute_mvp_music_live_players':'Couper la musique de MJ si les deux équipes sont en vie',
'snd_eq_competitive':'Égaliseur : compétitif', 'snd_eq_casual':'Égaliseur : occasionnel',
'snd_eq_deathmatch':'Égaliseur : match à mort', 'snd_eq_arms_race':'Égaliseur : course à l’armement',
'cl_crosshair_gap':'Écart du viseur', 'cl_crosshair_dynamic_spread_limit':'Limite de dispersion dynamique',
'cl_crosshair_dynamic_splitdist':'Distance de séparation', 'cl_crosshair_dynamic_splitalpha_innermod':'Transparence intérieure',
'cl_crosshair_dynamic_splitalpha_outermod':'Transparence extérieure', 'cl_crosshair_dynamic_maxdist_splitratio':'Taille des quadrants',
'cl_ironsight_usecrosshaircolor':'Couleur du viseur pour le point de la lunette', 'cl_ironsight_dot_scale':'Échelle du point de la lunette',
'cl_grenadecrosshair_keepusercrosshair':'Conserver le viseur standard', 'cl_grenadecrosshairdelay_flash':'Grenades flash',
'cl_grenadecrosshairdelay_explosive':'Grenades explosives', 'cl_grenadecrosshairdelay_fire':'Molotov / grenades incendiaires',
'cl_grenadecrosshairdelay_smoke':'Grenades fumigènes', 'cl_grenadecrosshairdelay_decoy':'Grenades leurre',
'install_dlc_workshoptools':'Installer les outils du Workshop', 'thread_pool_option':'Utilisation des cœurs du processeur',
'cl_teamcounter_playercount_instead_of_avatars':'Afficher le nombre de personnes survivantes',
'ui_steam_overlay_notification_position':'Emplacement des notifications communautaires',
'ui_steam_overlay_notification_position_horz':'Décalage horizontal des notifications',
'ui_steam_overlay_notification_position_vert':'Décalage vertical des notifications',
'cl_weapon_selection_rarity_color':'Mettre les armes rares en surbrillance', 'cl_teammate_colors_show':'Couleurs individuelles en compétitif',
'lobby_default_privacy_bits':'Accès par défaut à la salle d’attente', 'ui_setting_advertiseforhire_auto':'Recherche de groupe au démarrage',
'cl_player_ping_mute':'Localisations', 'cl_mute_enemy_team':'Rendre muette l’équipe ennemie',
'cl_mute_all_but_friends_and_party':'Rendre tout le monde muet sauf les contacts', 'cl_allow_animated_avatars':'Autoriser les avatars animés',
'cl_hide_avatar_images':'Masquer les avatars et objets personnalisés', 'cl_sanitize_player_names':'Simplifier les noms',
'spec_usenumberkeys_nobinds':'Méthode de sélection des votes et spectateurs', 'cl_scoreboard_mouse_enable_binding':'Activer la souris sur le tableau des scores',
'eom_local_player_defeat_anim_enabled':'Animation de défaite en fin de partie', 'cl_scoreboard_survivors_always_on':'Afficher les survivants à chaque manche',
'cl_obs_interp_enable':'Transitions douces de la caméra spectatrice', 'cl_obs_interp_speed':'Vitesse des transitions de caméra',
'r_drawtracers_firstperson':'Traînée aérienne en vue subjective', 'cl_use_opens_buy_menu':'Ouvrir le menu d’achat avec Utiliser',
'cl_buywheel_nonumberpurchasing':'Touches numériques du menu d’achat', 'cl_buywheel_donate_key':'Raccourci pour donner une arme',
'cl_quickinventory_lastinv':'Sélectionner la dernière arme utilisée', 'cl_hud_radar_map_additive':'Radar transparent',
'cl_hud_radar_blur_background':'Flouter l’arrière-plan du radar', 'cl_hud_radar_background_alpha':'Opacité de l’arrière-plan du radar',
'cl_radar_scale_dynamic':'Zoom dynamique du radar', 'cl_predict_body_shot_fx':'Prédire les effets des tirs dans le corps',
'cl_predict_head_shot_fx':'Prédire les effets des tirs en pleine tête', 'cl_predict_kill_ragdolls':'Prédire les cadavres des victimes',
'cl_hud_telemetry_frametime_show':'Afficher le temps d’affichage et les IPS', 'cl_hud_telemetry_frametime_poor':'Seuil d’alerte du temps d’affichage',
'cl_hud_telemetry_ping_show':'Afficher la latence', 'cl_hud_telemetry_net_misdelivery_show':'Afficher les problèmes de réseau',
'cl_hud_telemetry_net_misdelivery_poor':'Seuil d’alerte des ticks réseau manqués', 'cl_hud_telemetry_net_quality_graph_show':'Afficher le graphique de qualité réseau',
'cl_hud_telemetry_net_detailed':'Afficher le détail de la qualité réseau',
}
bindfr={'+forward':'Avancer','+back':'Reculer','+left':'Esquive gauche','+right':'Esquive droite',
'+sprint':'Marcher','+duck':'S’accroupir','+jump':'Sauter','+use':'Utiliser','+attack':'Tirer','+attack2':'Tir secondaire',
'+reload':'Recharger','drop':'Lâcher l’arme','lastinv':'Dernière arme utilisée','invprev':'Arme précédente','invnext':'Arme suivante',
'+lookatweapon':'Examiner l’arme','switchhands':'Changer de main','buymenu':'Menu d’achat','autobuy':'Achat automatique',
'rebuy':'Rachat','slot1':'Arme principale','slot2':'Arme secondaire','slot3':'Arme de corps à corps','slot4':'Parcourir les grenades',
'slot5':'Bombe','slot6':'Grenade explosive','slot7':'Grenade flash','slot8':'Grenade fumigène','slot9':'Grenade leurre',
'slot10':'Molotov / incendiaire','slot11':'Zeus x27','slot12':'Seringue médicale','slot13':'Objets utilitaires',
'+spray_menu':'Graffitis','+showscores':'Tableau des scores','+cl_show_team_equipment':'Équipement de l’équipe',
'toggleradarscale':'Zoom du radar','callvote':'Proposer un vote','teammenu':'Choisir une équipe',
'toggleconsole':'Afficher / masquer la console','player_ping':'Localisation','radio':'Messages radio',
'radio1':'Radio de commandement','radio2':'Radio standard','radio3':'Messages de rapport','messagemode2':'Message à l’équipe',
'messagemode':'Message général','+voicerecord':'Utiliser le micro','show_loadout_toggle':'Afficher / masquer l’inventaire',
'+quickinv':'Menu circulaire des armes','voice_toggle_open_mic':'Basculer le mode du micro','clutch_mode_toggle':'Couper le chat vocal',
'+radialradio':'Roue de dialogue 1','+radialradio2':'Roue de dialogue 2','+radialradio3':'Roue de dialogue 3'}
menus={};binds={}
for tab in ['video','audio','game','kbmouse','crosshair']:
    tree=ET.parse(base/f'menu-audit/settings_{tab}.xml')
    section=[tab.title(),{'video':'Vidéo','audio':'Audio','game':'Jeu','kbmouse':'Souris','crosshair':'Viseur'}[tab]]
    def walk(e):
        global section
        if 'SettingsSectionTitleLabel' in e.get('class',''):
            token=e.get('text','').lstrip('#')
            section=sections.get(token,[label(token),label(token)])
        key=e.get('convar') or e.get('bind')
        if key:
            token=e.get('text')
            if not token:
                parent=parents.get(e)
                if parent is not None:
                    token=next((c.get('text') for c in parent if c.tag=='Label' and c.get('text')),None)
            french=fr.get(key,bindfr.get(key))
            if french is None and key.startswith('snd_'):
                french=next((v for k,v in fr.items() if key.startswith(k+'_')),None)
            item={'tab':tab,'section':section[:],'label':[label(token or key),french or label(token or key)]}
            if e.get('convar'):
                item['type']='enum' if 'EnumDropDown' in e.tag else 'number'
                options=[{'value':c.get('value'),'label':[label(c.get('text') or c.get('value') or ''),label(c.get('text') or c.get('value') or '')]} for c in e if c.get('value') is not None]
                if options: item['options']=options
                for name in ['min','max','displayprecision']:
                    if e.get(name) is not None: item[name]=float(e.get(name))
                item['audioGain']=e.get('audiogain')=='true'
                item['percentage']=e.get('percentage')=='true'
                menus[key]=item
            else: binds[key]=item
        for c in e:walk(c)
    parents={c:p for p in tree.iter() for c in p}
    walk(tree.getroot())
# The per-mode music controls use the same command with a mode suffix.
for key,item in list(menus.items()):
    if key.startswith('snd_') and ('volume' in key):
        for mode,title,frtitle in [('casual','Casual','Occasionnel'),('deathmatch','Deathmatch','Match à mort'),('armsrace','Arms race','Course à l’armement'),('rush','Retakes','Reprise')]:
            menus[key+'_'+mode]={**item,'section':[f'Music · {title}',f'Musiques · {frtitle}'],'label':[item['label'][0],item['label'][1]]}
convars={}
for line in (base/'convars.txt').read_text(encoding='utf-8').splitlines():
    m=re.match(r'^([A-Za-z_][\w]*) (.*?) \((.*)\)$',line)
    if not m: continue
    name,default,flags=m.groups()
    meta={'default':default.strip('"'),'flags':flags}
    for field in ['min','max']:
        val=re.search(field+r': (-?[\d.]+)',flags)
        if val:meta[field]=float(val[1])
    convars[name.lower()]=meta
videoIDs={'VSync':'setting.mat_vsync','Reflex':'setting.r_low_latency','CSMQuality':'setting.videocfg_shadow_quality','CSMQualityLevel':'setting.videocfg_shadow_quality','DynamicShadows':'setting.videocfg_dynamic_shadows','ModelTextureDetail':'setting.videocfg_texture_detail','TextureFiltering':'setting.r_texturefilteringquality','ShaderDetail':'setting.shaderquality','ParticleDetail':'setting.videocfg_particle_detail','AmbientOcclusion':'setting.videocfg_ao_detail','HDR':'setting.videocfg_hdr_detail','FSR':'setting.videocfg_fsr_detail','AspectRatioEnum':'setting.aspectratiomode'}
videoIDs.update({'FilteringMode':'setting.r_texturefilteringquality','AOProxy':'setting.videocfg_ao_detail'})
videoMenus={}
for e in ET.parse(base/'menu-audit/settings_video.xml').iter():
    key=videoIDs.get(e.get('id'))
    if key:
        videoMenus[key]=[{'value':c.get('value'),'label':[label(c.get('text') or c.get('value')),label(c.get('text') or c.get('value'))]} for c in e if c.get('value') is not None]
catalog={'checkedAt':args.checked_at,'source':'https://github.com/SteamTracking/GameTracking-CS2','menus':menus,'binds':binds,'videoMenus':videoMenus,'convars':convars}
# No game assets or source XML shipped, only setting names / factual control metadata.
(out/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f'{len(menus)} menu mappings, {len(binds)} actions, {len(convars)} convars')
