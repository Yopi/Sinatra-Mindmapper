helpers do
  def view(view)
    haml view
  end
end

def check_permission(action)
  if action == 'delete' || action == 'user_edit'
    return true if @permissions > 1
  elsif action == 'create' || action == 'edit'
    return true if @permissions > 0
  end

  return false
end
