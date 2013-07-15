#!/bin/env ruby
# encoding: utf-8

require 'rubygems'
require 'bundler'
Bundler.require(:default)

require './extra/database'
require './extra/helper'

use Rack::MethodOverride
use Rack::Session::Pool
set :public_folder, "#{File.dirname(__FILE__)}/public/"
set :port, 9449
markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, lax_spacing: true)

before do
  @user = session[:user]
  if !@user.nil?
    @permissions = @user.permissions
  else
    @permissions = 0
  end
end

get '/article/new' do
  redirect '/' unless check_permission('create')

  @article = Article.new
  @action = 'create'
  view :article_edit
end

get %r{/article/([\d]+)\.?(json)?$} do
  id = params[:captures].first
  json = params[:captures].last

  @articles = Article.all
  @article = Article.get(id)

  if json.nil?
    view :article
  else
    @article.to_json
  end
end

post '/article/create' do
  redirect '/' unless check_permission('create')

  @article = Article.new  title:            params[:article_title],
                          content:          params[:article_text],
                          rotation:         params[:article_rotation],
                          parent:           params[:article_parent],
                          distance:         params[:article_distance],
                          content_markdown: markdown.render(params[:article_text])

  if @article.save
      redirect "/article/#{@article.id}"
  else
      @action = 'create'
      @error = 'Något gick fel, försök igen.'
      view :article_edit
  end
end

get '/article/edit/:id' do
  redirect '/' unless check_permission('edit')

  @article = Article.get(params[:id])
  @action = 'edit'
  if @article
    view :article_edit
  else
    redirect '/'
  end
end

get '/article/delete/:id' do
  redirect '/' unless check_permission('delete')

  @article = Article.get(params[:id])
  view :article_delete
end

delete '/article' do
  redirect '/' unless check_permission('delete')

  @article = Article.get(params[:id])
  @article.destroy
  redirect '/'
end

post '/article/edit' do
  redirect '/' unless check_permission('edit')
  @article = Article.get(params[:id])

  if @article
    puts @article.version
    @article.title = params[:article_title]
    @article.content = params[:article_text]
    @article.content_markdown = markdown.render(params[:article_text])
    @article.rotation = params[:article_rotation] if Integer(params[:article_rotation]) rescue false
    @article.parent = params[:article_parent] if Integer(params[:article_parent]) rescue false
    @article.distance = params[:article_distance] if Integer(params[:article_distance]) rescue false
    @article.updated_at = Time.now

    if @article.save
      redirect "/article/#{@article.id}"
    else
      redirect "/article/edit/#{@article.id}"
    end
  else
    redirect '/'
  end
end

get '/article/all.json' do
  @articles = Article.all(order: [:parent.asc])
  @articles.to_json
end

get '/map' do
  @map = true
  haml :map
end

get '/' do
  @articles = Article.all
  view :index
end

# User handling
get '/user' do
  redirect '/' unless check_permission('user_edit')
  @users = User.all
  view :user
end

get '/user/login' do
  @action = 'login'
  view :user_login
end

post '/user/login' do
  user = User.first(email: params[:user_email])
  redirect '/user/login' if user.nil?
  if user.password.is_password?(params[:user_password])
    session[:user] = user
    redirect '/'
  else
    redirect '/user/login'
  end
end

get '/user/create' do
  @action = 'create'
  view :user_login
end

post '/user/create' do
  @user = User.new(email: params[:user_email])
  @user.password = params[:user_password]
  if @user.save
    session[:user] = @user
    redirect '/'
  else
    redirect '/user/create'
  end
end

get '/user/logout' do
  session[:user] = nil
  redirect '/'
end

post '/user/edit' do
  user = User.get(params[:user_id])
  if user
    user.email = params[:user_email]
    user.password = params[:user_password] unless params[:user_password].empty?
    user.permissions = params[:user_permissions] if Integer(params[:user_permissions]) rescue false
    user.save!
    redirect '/user'
  end
end
