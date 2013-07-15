require 'rubygems'
require 'data_mapper'
require 'dm-sqlite-adapter'
require 'bcrypt'

DataMapper::Logger.new($stdout, :debug)
DataMapper.setup(:default, "sqlite3://#{File.expand_path(File.dirname(__FILE__))}/../db/mindmap.db")
DataMapper::Model.raise_on_save_failure

class Article
  include DataMapper::Resource

  property :id, Serial
  property :title, String
  property :content, Text
  property :content_markdown, Text
  property :parent, Integer
  property :rotation, Integer
  property :distance, Integer, default: 200
  property :version, Integer, default: 1
  property :created_at, DateTime, default: DateTime.now
  property :updated_at, DateTime
end

class User
  include DataMapper::Resource
  include BCrypt

  property :id, Serial
  property :email, String
  property :password_hash, Text
  property :permissions, Integer, default: 0
  property :created_at, DateTime, default: DateTime.now

  def password
    @password ||= Password.new(password_hash)
  end

  def password=(new_password)
    @password = Password.create(new_password)
    self.password_hash = @password
  end
end

DataMapper.finalize
DataMapper.auto_upgrade!