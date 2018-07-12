const mongoose = require('mongoose');
const User = require('../models/user');
function calcLev(leaderPoint) {
    levelExp = 40;
    level = 0;
    let lp = leaderPoint;
    while (lp >= levelExp) {
        level++;
        lp -= levelExp;
        if (levelExp < 200)
            levelExp *= 2;
        else
            levelExp *= 3;
    }
    return {
        m_level: level,
        m_levelExpPercent: Math.floor((lp /levelExp) *100),
        m_lp: lp,
        m_next : levelExp - lp,
        m_total :leaderPoint 
    }
};

exports.calculateLevel = calcLev;

//achevement calculaion
exports.calculateAchievements = (bp, lp, win) => {
    let achievementList = [];
    let unachievedList = [];
    //achievements ->
    let a_rookie = {
        title : 'Rookie',
        info : 'Reached level 5!',
        img : 'king.jpg'
    }
    let a_intermediate = {
        title : 'Intermediate',
        info : 'Reached level 10!',
        img : 'king.jpg'
    }
    let a_veteran = {
        title : 'Veteran',
        info : 'Reached level 20!',
        img : 'king.jpg'
    }
    let a_pro = {
        title : 'Pro',
        info : 'Reached level 50!',
        img : 'king.jpg'
    }
    let a_master = {
        title : 'Master',
        info : 'Reached level 100!',
        img : 'king.jpg'
    }
    let a_hungry = {
        title : 'Hungry',
        info : 'Has Won  50 Matches!',
        img : 'king.jpg'
    }
    let a_formidable = {
        title : 'Formidable',
        info : 'Has Won  100 Matches!',
        img : 'king.jpg'
    }
    let a_specialist = {
        title : 'Specialist',
        info : 'Has Won  500 Matches!',
        img : 'king.jpg'
    }
    let a_champion = {
        title : 'Champion',
        info : 'Has Won  1,000 Matches!',
        img : 'king.jpg'
    }
    let a_victor = {
        title : 'Victor',
        info : 'Has Won  10,000 Matches!',
        img : 'king.jpg'
    }
    let a_cashy = {
        title : 'Cashy',
        info : 'Has Earned 500 BP!',
        img : 'king.jpg'
    }
    let a_struggler = {
        title : 'Struggler',
        info : 'Has Earned 2,000 BP!',
        img : 'king.jpg'
    }
    let a_wealthy = {
        title : 'Wealthy',
        info : 'Has Earned 10,000 BP!',
        img : 'king.jpg'
    }
    let a_duke = {
        title : 'Duke',
        info : 'Has Earned 50,000 BP!',
        img : 'king.jpg'
    }
    let a_king = {
        title : 'King',
        info : 'Has Earned 100,000 BP!',
        img : 'king.jpg'
    }
    let a_emperor = {
        title : 'Emperor',
        info : 'Has Earned 500,000 BP!',
        img : 'king.jpg'
    }
    let a_millionear = {
        title : 'Millionear',
        info : 'Has Earned 1,000,000 BP!',
        img : 'king.jpg'
    }

    //achevement attachment
    let summary = calcLev(lp);
    let level = summary.m_level;

    if(level >= 5) achievementList.push(a_rookie);
    else unachievedList.push(a_rookie);

    if(level >= 10) achievementList.push(a_intermediate);
    else unachievedList.push(a_intermediate);

    if(level >= 20) achievementList.push(a_veteran);
    else unachievedList.push(a_veteran);

    if(level >= 50) achievementList.push(a_pro);
    else unachievedList.push(a_pro);

    if(level >= 100) achievementList.push(a_master);
    else unachievedList.push(a_master);

    if(win >= 50) achievementList.push(a_hungry);
    else unachievedList.push(a_hungry);

    if(win >= 100) achievementList.push(a_formidable);
    else unachievedList.push(a_formidable);

    if(win >= 500) achievementList.push(a_specialist);
    else unachievedList.push(a_specialist);

    if(win >= 1000) achievementList.push(a_champion);
    else unachievedList.push(a_champion);

    if(win >= 10000) achievementList.push(a_victor);
    else unachievedList.push(a_victor);

    if(bp >= 500) achievementList.push(a_cashy);
    else unachievedList.push(a_cashy);

    if(bp >= 2000) achievementList.push(a_struggler);
    else unachievedList.push(a_struggler);

    if(bp >= 10000) achievementList.push(a_wealthy);
    else unachievedList.push(a_wealthy);

    if(bp >= 50000) achievementList.push(a_duke);
    else unachievedList.push(a_duke);

    if(bp >= 100000) achievementList.push(a_king);
    else unachievedList.push(a_king);

    if(bp >= 500000) achievementList.push(a_emperor);
    else unachievedList.push(a_emperor);

    if(bp >= 1000000) achievementList.push(a_millionear);
    else unachievedList.push(a_millionear);


    return {
        achieved : achievementList,
        unachieved : unachievedList
    }
}

exports.calculateReward = (battlePoints) => {
    let bp = Math.floor(battlePoints * 1.8);
    let lp = Math.floor(battlePoints * 0.6 + 1);
    return {
        m_bp: bp,
        m_lp: lp
    }
}

exports.makeString = (type) => {
    if (type == 'connection') {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    else if(type == 'user') {
        'u-' + new Date().valueOf() + '-'+ Math.random().toString(36).substring(4);
    }
    else {
        return `error! undefined type : ${type}`
    }
}



