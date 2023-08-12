

let string = require('../Model/string.js');
let skill = require('../Model/base/skill.js');
let quai = require('../Model/base/quai.js');

let callbackOjectDat = require('./objectDat.js');

let callbackBOSS = require('./boss.js');

let redis = require('../Model/redis.js');



let mobServer = function(io)
{
	let zone = [];
	let start = Date.now();
	redis.listMapHavePlayer().then(MapHave => {

		Promise.all(MapHave.map((list,indexx) => {

			redis.mobInZone(list.map,list.zone).then(mob => {

				Promise.all(mob.map((x,index) => {
					let e = mob[index];
					e.timedelete = Date.now() + 60000;
					return new Promise((res,fai) => {
						// reset hiệu ứng
			
						if(e.eff) 
						{
							for(let eff in e.eff) 
							{
								if(e.eff[eff].time <= Date.now() && e.eff[eff].active == true) 
								{
									console.log('hết giờ')
									e.eff[eff].active = false;
								}
							}
						}
						// done
						// hồi sinh quái
						if(e.info.chiso.hp <=0) 
						{
							let infoMob = quai.find(e2 => e2.id == e.uid);
			
					
							if(infoMob)
							{
			
								if(e.info.chiso.hp <=0 && e.time.timehoisinh  == 0) {
									e.time.timehoisinh = Date.now() + infoMob.time*1000;
									console.log(infoMob.time*1000)
									e.info.coban.sieuquai = -1;
									e.info.chiso.hpFull = infoMob.chiso.hpFull;
									e.info.chiso.sucdanh = infoMob.chiso.sucdanh;
									e.info.chiso.giap = infoMob.chiso.giap;
									e.info.coban.super = "";
									redis.setMob(e.id,e).then(() => {});
			
								} 
								else 
								if(e.info.chiso.hp <=0 && e.time.timehoisinh  <= Date.now())
								{ 
									let rand = string.rand(1,100);
									let chiso = [0,1.5,2.0,3.0]; // namek, trái đất, saiyan
									let name = [0,'namek','traidat','saiyan'];
			
									if(string.rand(1,100) <= 100) 
									{
										// xuất hiện siêu quái
										if(rand <= 40) e.info.coban.sieuquai = 1; // namek
										else if(rand <= 70) e.info.coban.sieuquai = 2; // trái đất
										else if(rand <= 100) e.info.coban.sieuquai = 3; // saiyan
			
										console.log('số,',rand)
									}
			
									let number = infoMob.exp;
									e.exp = number;
			
									if(e.info.coban.sieuquai != -1)
									{
										e.info.chiso.hpFull = infoMob.chiso.hpFull * chiso[e.info.coban.sieuquai];
										e.info.chiso.sucdanh = infoMob.chiso.sucdanh * chiso[e.info.coban.sieuquai];
										e.info.chiso.giap = infoMob.chiso.giap * chiso[e.info.coban.sieuquai];
										e.info.coban.super = name[e.info.coban.sieuquai];
										e.exp = number * chiso[e.info.coban.sieuquai];
									}
			
			
									e.info.chiso.hp = e.info.chiso.hpFull;
									e.victim = [];
									e.time.timehoisinh = 0;
		
									redis.setMob(e.id,e).then(() => {});
			
									io.sendMap({
										id : e.id,
										info : e.info,
									},e,'mobHS')
								}
					
							}
							res({})
						}
						else  
						{
							if( !(zone.find(z => z.pos.zone == e.pos.zone && z.pos.map == e.pos.map)) ) 
							{
								zone.push({
									pos : {
										zone : e.pos.zone,
										map : e.pos.map,
									}
								}); 
							}
			
							// thêm hiệu ứng
							if(e.eff && e.eff.rungu && e.eff.rungu.active == true)
							{
								// not work
								res({});
							}
							else
							if(e.eff && e.eff.thaiduonghasan && e.eff.thaiduonghasan.active == true)
							{
								// not work
								res({});
							}
							else
							if(e.time.timedanh <= Date.now())
							{
								// di chuyển
								let rand = string.rand(1,10);
								if(rand%2 == 0 )
								{
									e.info.move = 'right';
									e.info.act = 'move';
									e.pos.x  = e.pos.xMax;
								}
								else
								{
									e.info.move = 'left';
									e.info.act = 'move';
									e.pos.x  = e.pos.xMin;
									
								} 
			
								e.time.timedanh = Date.now() + 2000;
								redis.setMob(e.id,e).then(() => {
									if(e.info.chiso.hp > 0)
									{
										res({
											_1 : e.id,
											_2 : e.pos,
											_3 : e.info.move,
											_4 : e.info.act,
											_5 : e.eff,
											_6 : true,
										})
									}
									else 
									{
										res({
											_1 : e.id,
											_2 : e.pos,
											_3 : e.info.move,
											_4 : e.info.act,
											_5 : e.eff,
											_6 : false,
										})
									}
								});
			
							}       
							else 
							{
								// random id in victim
								let victim = e.victim[string.rand(0,e.victim.length-1)];
								if(victim)
								{
									// get info player
		
									redis.getPlayer(victim).then(infoPlayer => {
										if(infoPlayer) 
										{
											if(infoPlayer.info.chiso.hp <=0 || infoPlayer.pos.map != e.pos.map || infoPlayer.pos.zone != e.pos.zone)
											{
												// remove victim
												e.victim = e.victim.filter(e2 => e2 != victim);
											}
											else 
											{
												let tanCong = e.info.chiso.sucdanh;
												
												if(infoPlayer.info.chiso.hp <=0)
												{
													infoPlayer.info.chiso.hp = 0;
													e.victim = e.victim.filter(e2 => e2 != victim);
												}

												process.send({
													since04 : {
														type : 'mob_attack',
														uid : victim,
														dame : tanCong,
														e : e,
													}
												})
												
												e.info.act = 'attack';
												if(e.pos.x < infoPlayer.pos.x)
												{
													e.info.move = 'right';
												}
												else
												{
													e.info.move = 'left';
												} 
												
											}
										}
										else 
										{
											// remove victim
											e.victim = e.victim.filter(e2 => e2 != victim);
										}
		
										if(e.info.chiso.hp > 0)
										{
											res({
												_1 : e.id,
												_2 : e.pos,
												_3 : e.info.move,
												_4 : e.info.act,
												_5 : e.eff,
												_6 : true,
											})
										}
										else 
										{
											res({
												_1 : e.id,
												_2 : e.pos,
												_3 : e.info.move,
												_4 : e.info.act,
												_5 : e.eff,
												_6 : false,
											})
										}
									});
		
								}
								else 
								{
									if(e.info.chiso.hp > 0)
									{
										res({
											_1 : e.id,
											_2 : e.pos,
											_3 : e.info.move,
											_4 : e.info.act,
											_5 : e.eff,
											_6 : true,
										})
									}
									else 
									{
										res({
											_1 : e.id,
											_2 : e.pos,
											_3 : e.info.move,
											_4 : e.info.act,
											_5 : e.eff,
											_6 : false,
										})
									}
								}
							}
						}
			
		
						
			
						// save e to mob
						//Object.assign(mob.find(e2 => e2.id == e.id),e);
						
						// save data
					});
				})).then(res => {
					zone.forEach(e => {
						let listMob = res.filter(e2 => e2._2 &&  e2._2.map == e.pos.map && e2._2.zone == e.pos.zone && e2._6 == true);
						io.sendMap({
							_1 : listMob,
							_c : string.rand(1,100),
						},e);
					});
		
		
					
					
				})
				
			});

		})).then(res => {
			//console.log('mob',Date.now() - start,'ms');
			setTimeout(() => {
				mobServer(io);
			}, 1000);
		});
		
		
	}); 

	


}


deleteMob = function(io) {
	redis.mobALL().then(mob => {
		//console.log('mob',mob.length,'số lượng')
		Promise.all(mob.map((x,index) => {


			if(x.timedelete <= Date.now() || x.timedelete == undefined  ) 
			{
				return new Promise((res,fai) => {
					redis.delMob(x.id).then(() => {
						//console.log('Xoá x+'+x.id,'map:',x.pos.map,'zone:',x.pos.zone);
						res({});
					});
				}); 
			}

		})).then(res => {
			setTimeout(() => {
				deleteMob(io);
			}, 5000);
		})
	});
}


let mobServer0 = function(io)
{
	let zone = [];
	let start = Date.now();
	redis.mobALL().then(mob => {
		console.log('mob',mob.length,'số lượng')
		Promise.all(mob.map((x,index) => {
			let e = mob[index];
			return new Promise((res,fai) => {
				// reset hiệu ứng
	
				if(e.eff) 
				{
					for(let eff in e.eff) 
					{
						if(e.eff[eff].time <= Date.now() && e.eff[eff].active == true) 
						{
							console.log('hết giờ')
							e.eff[eff].active = false;
						}
					}
				}
				// done
				// hồi sinh quái
				if(e.info.chiso.hp <=0) 
				{
					let infoMob = quai.find(e2 => e2.id == e.uid);
	
			
					if(infoMob)
					{
	
						if(e.info.chiso.hp <=0 && e.time.timehoisinh  == 0) {
							e.time.timehoisinh = Date.now() + infoMob.time*1000;
							console.log(infoMob.time*1000)
							e.info.coban.sieuquai = -1;
							e.info.chiso.hpFull = infoMob.chiso.hpFull;
							e.info.chiso.sucdanh = infoMob.chiso.sucdanh;
							e.info.chiso.giap = infoMob.chiso.giap;
							e.info.coban.super = "";
							redis.setMob(e.id,e).then(() => {});
	
						} 
						else 
						if(e.info.chiso.hp <=0 && e.time.timehoisinh  <= Date.now())
						{ 
							let rand = string.rand(1,100);
							let chiso = [0,1.5,2.0,3.0]; // namek, trái đất, saiyan
							let name = [0,'namek','traidat','saiyan'];
	
							if(string.rand(1,100) <= 100) 
							{
								// xuất hiện siêu quái
								if(rand <= 40) e.info.coban.sieuquai = 1; // namek
								else if(rand <= 70) e.info.coban.sieuquai = 2; // trái đất
								else if(rand <= 100) e.info.coban.sieuquai = 3; // saiyan
	
								console.log('số,',rand)
							}
	
							let number = infoMob.exp;
							e.exp = number;
	
							if(e.info.coban.sieuquai != -1)
							{
								e.info.chiso.hpFull = infoMob.chiso.hpFull * chiso[e.info.coban.sieuquai];
								e.info.chiso.sucdanh = infoMob.chiso.sucdanh * chiso[e.info.coban.sieuquai];
								e.info.chiso.giap = infoMob.chiso.giap * chiso[e.info.coban.sieuquai];
								e.info.coban.super = name[e.info.coban.sieuquai];
								e.exp = number * chiso[e.info.coban.sieuquai];
							}
	
	
							e.info.chiso.hp = e.info.chiso.hpFull;
							e.victim = [];
							e.time.timehoisinh = 0;

							redis.setMob(e.id,e).then(() => {});
	
							io.sendMap({
								id : e.id,
								info : e.info,
							},e,'mobHS')
						}
			
					}
					res({})
				}
				else  
				{
					if( !(zone.find(z => z.pos.zone == e.pos.zone && z.pos.map == e.pos.map)) ) 
					{
						zone.push({
							pos : {
								zone : e.pos.zone,
								map : e.pos.map,
							}
						}); 
					}
	
					// thêm hiệu ứng
					if(e.eff && e.eff.rungu && e.eff.rungu.active == true)
					{
						// not work
						res({});
					}
					else
					if(e.eff && e.eff.thaiduonghasan && e.eff.thaiduonghasan.active == true)
					{
						// not work
						res({});
					}
					else
					if(e.time.timedanh <= Date.now())
					{
						// di chuyển
						let rand = string.rand(1,10);
						if(rand%2 == 0 )
						{
							e.info.move = 'right';
							e.info.act = 'move';
							e.pos.x  = e.pos.xMax;
						}
						else
						{
							e.info.move = 'left';
							e.info.act = 'move';
							e.pos.x  = e.pos.xMin;
							
						} 
	
						e.time.timedanh = Date.now() + 2000;
						redis.setMob(e.id,e).then(() => {
							if(e.info.chiso.hp > 0)
							{
								res({
									_1 : e.id,
									_2 : e.pos,
									_3 : e.info.move,
									_4 : e.info.act,
									_5 : e.eff,
									_6 : true,
								})
							}
							else 
							{
								res({
									_1 : e.id,
									_2 : e.pos,
									_3 : e.info.move,
									_4 : e.info.act,
									_5 : e.eff,
									_6 : false,
								})
							}
						});
	
					}       
					else 
					{
						// random id in victim
						let victim = e.victim[string.rand(0,e.victim.length-1)];
						if(victim)
						{
							// get info player

							redis.getPlayer(victim).then(infoPlayer => {
								if(infoPlayer) 
								{
									if(infoPlayer.info.chiso.hp <=0 || infoPlayer.pos.map != e.pos.map || infoPlayer.pos.zone != e.pos.zone)
									{
										// remove victim
										e.victim = e.victim.filter(e2 => e2 != victim);
									}
									else 
									{
										let tanCong = e.info.chiso.sucdanh;
										let giap = infoPlayer.info.chiso.giap;
										let dame = tanCong - giap;
										let dameMax = tanCong/100*110;
										dame = string.rand(dame,dameMax);
										dame = infoPlayer.eff && infoPlayer.eff.khieng && infoPlayer.eff.khieng.active == true ? 1 : dame;
										if(dame < 0) dame = 0;
										infoPlayer.info.chiso.hp -= dame;
										if(infoPlayer.info.chiso.hp <=0)
										{
											infoPlayer.info.chiso.hp = 0;
											e.victim = e.victim.filter(e2 => e2 != victim);
										}
										
										e.info.act = 'attack';
										if(dame > 0) 
										{
											if(e.pos.x < infoPlayer.pos.x)
											{
												e.info.move = 'right';
											}
											else
											{
												e.info.move = 'left';
											} 
											io.sendMap({
												_1 : e.id,
												_2 : victim,
												_3 : dame,
												_4 : 'truhp',
												_5 : {
													hp : e.info.chiso.hp,
													ki : e.info.chiso.ki,
													kiFull : e.info.chiso.kiFull,
													hpFull : e.info.chiso.hpFull,
												}, 
												_6 : {
													hp : infoPlayer.info.chiso.hp,
													ki : infoPlayer.info.chiso.ki,
													kiFull : infoPlayer.info.chiso.kiFull,
													hpFull : infoPlayer.info.chiso.hpFull,
													sucmanh : infoPlayer.info.coban.sucmanh,
													tiemnang : infoPlayer.info.coban.tiemnang,
												},
												_e : string.rand(1,100), // gửi tới id này
											},e);
											
											redis.setPlayer(infoPlayer.id,infoPlayer).then(() => {
											});
			
										}
									}
								}
								else 
								{
									// remove victim
									e.victim = e.victim.filter(e2 => e2 != victim);
								}

								if(e.info.chiso.hp > 0)
								{
									res({
										_1 : e.id,
										_2 : e.pos,
										_3 : e.info.move,
										_4 : e.info.act,
										_5 : e.eff,
										_6 : true,
									})
								}
								else 
								{
									res({
										_1 : e.id,
										_2 : e.pos,
										_3 : e.info.move,
										_4 : e.info.act,
										_5 : e.eff,
										_6 : false,
									})
								}
							});

						}
						else 
						{
							if(e.info.chiso.hp > 0)
							{
								res({
									_1 : e.id,
									_2 : e.pos,
									_3 : e.info.move,
									_4 : e.info.act,
									_5 : e.eff,
									_6 : true,
								})
							}
							else 
							{
								res({
									_1 : e.id,
									_2 : e.pos,
									_3 : e.info.move,
									_4 : e.info.act,
									_5 : e.eff,
									_6 : false,
								})
							}
						}
					}
				}
	

				
	
				// save e to mob
				//Object.assign(mob.find(e2 => e2.id == e.id),e);
				
				// save data
			});
		})).then(res => {
			zone.forEach(e => {
				let listMob = res.filter(e2 => e2._2 &&  e2._2.map == e.pos.map && e2._2.zone == e.pos.zone && e2._6 == true);
				io.sendMap({
					_1 : listMob,
					_c : string.rand(1,100),
				},e);
			});

			console.log('mob',Date.now() - start,'ms');

			
			setTimeout(() => {
				mobServer(io);
			}, 1000);
		})
	}); 

	
}



let buffServer = function(io) {

	let retime = setInterval(function(){

		// kĩ năng tái tạo năng lượng
		let list_player_taitao = player.filter(e => e.eff && e.eff.taitaonangluong && e.eff.taitaonangluong.active == true);
		

		Promise.all(list_player_taitao.map(e => {
			return new Promise((res,fai) => {

				let mySKill = e.skill.find(e2 => e2.id == 8);
				if(!mySKill) return res();
				let lvSkill = mySKill.level;
				let infoSkill = skill.find(e2 => e2.id == 8);
				if(!infoSkill) return res();
				let tacdung = infoSkill.dame[lvSkill];
				let hpcong = e.info.chiso.hpFull / 100 * tacdung;
				hpcong = Math.round(hpcong);
				if(e.eff && e.eff.taitaonangluong && e.eff.taitaonangluong.time <= Date.now()) {
					e.eff.taitaonangluong.active = false;
					io.sendMap({
						_1 : e,
						_g : string.rand(1,100),
					},e)
					Object.assign(player,e);
					return res();
				}

				if(e.info.chiso.hp <=0) 
				{
					e.eff.taitaonangluong.active = false;
					io.sendMap({
						_1 : e,
						_g : string.rand(1,100),
					},e)
					Object.assign(player,e);
					return res();
					
				} 

				e.info.chiso.hp += hpcong;
				if(e.info.chiso.hp > e.info.chiso.hpFull) e.info.chiso.hp = e.info.chiso.hpFull;
				let kicong = e.info.chiso.kiFull / 100 * tacdung;
				kicong = Math.round(kicong);
				e.info.chiso.ki += kicong;
				
				if(e.info.chiso.ki > e.info.chiso.kiFull) e.info.chiso.ki = e.info.chiso.kiFull;

				if(e.info.chiso.hp >= e.info.chiso.hpFull && e.info.chiso.ki >= e.info.chiso.kiFull) {
					e.eff.taitaonangluong.active = false;
					io.sendMap({
						_1 : e,
						_g : string.rand(1,100),
					},e)
				}
				
				io.sendMap({
					_1 : e.id,
					_2 : e.id,
					_3 : hpcong,
					_4 : 'conghp',
					_5 : {
						hp : e.info.chiso.hp,
						ki : e.info.chiso.ki,
						kiFull : e.info.chiso.kiFull,
						hpFull : e.info.chiso.hpFull,
					}, 
					_6 : {
						hp : e.info.chiso.hp,
						ki : e.info.chiso.ki,
						kiFull : e.info.chiso.kiFull,
						hpFull : e.info.chiso.hpFull,
					}, 
					_e : string.rand(1,100),
				},e);

				// save data
				Object.assign(player,e);

				res();


			});
		}))
		.then(function(){

		});

	},1000);

	return retime;
}



let XuLyPlayer = function(io) {

	

}
 

 

module.exports = function(io) 
{
    io.sendMap = function(data,info, name = null) 
    {
		return io.to(info.pos.map+'_'+info.pos.zone).emit(name || string.az(string.rand(2,5)),data);
    }

	io.sendTo = function(data,id,name) 
	{
		let client = player.find(e=>e.id == id);
		if(!client) return false;
	  	return io.to(client.socket).emit(name || string.az(string.rand(2, 6)), data);
	}

	io.sendAll = function(data,name)
	{
		return io.to("game").emit(name || string.az(string.rand(2,5)),data);
	}

	io.chipi = function(msg,id) {
		return io.sendTo({
		  	chipi : msg
		},id)
	  }
  
	  io.noti = function(msg,id) {
		  return io.sendTo({
			noti : msg
		  },id)
		}

	//buffServer(io);
	//XuLyPlayer(io);
    mobServer(io); 
	//callbackDeTu(io);
	//callbackplayer(io);
	callbackOjectDat(io); // xoá vật phẩm on đất
	callbackBOSS(io);
	deleteMob(io)
}

