<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PokemonController;

Route::get('/hello', fn() => response()->json(['ok' => true]));
Route::get('/pokemon', [PokemonController::class, 'listPokemon']);
Route::get('/pokemon/{nameOrId}', [PokemonController::class, 'getPokemon']);
Route::get('/pokemon/{nameOrId}/species', [PokemonController::class, 'getSpecies']);
